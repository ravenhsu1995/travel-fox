-- Feedback visibility flag — controls whether per-item ratings & comments
-- (stored inside days.timeline JSON) leak out to public / unlisted share
-- viewers. Default false: owner-only by default. Owner sees feedback on
-- /trips/[id] regardless; this flag only gates /samples/[id] and /s/[token].
--
-- The rating/comment fields themselves live inside days.timeline (jsonb),
-- so no schema change is needed for the data — only this top-level toggle
-- and an extra field on the shared-trip RPC payload.

-- ────────────────────────────────────────────────────────────────────────
-- 1. trips.share_show_feedback
-- ────────────────────────────────────────────────────────────────────────

alter table trips
  add column if not exists share_show_feedback boolean not null default false;

-- ────────────────────────────────────────────────────────────────────────
-- 2. get_shared_trip_by_token — expose share_show_feedback in trip payload
-- ────────────────────────────────────────────────────────────────────────
-- The Node-side strip in /s/[token]/page.tsx reads this flag and removes
-- rating/comment from each timeline item before render when false. Keeping
-- the strip in Node (not SQL) avoids deep jsonb manipulation in plpgsql.

create or replace function get_shared_trip_by_token(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'visibility', t.visibility,
    'trip_id', t.id,
    'trip', case
      when t.visibility in ('unlisted', 'public') then jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'subtitle', t.subtitle,
        'start_date', t.start_date,
        'end_date', t.end_date,
        'cover_emoji', t.cover_emoji,
        'is_public_sample', t.is_public_sample,
        'visibility', t.visibility,
        'created_at', t.created_at,
        'share_show_feedback', t.share_show_feedback
      )
      else null
    end,
    'days', case
      when t.visibility in ('unlisted', 'public') then coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', d.id,
              'trip_id', d.trip_id,
              'date', d.date,
              'day_label', d.day_label,
              'theme', d.theme,
              'hotel', d.hotel,
              'timeline', d.timeline,
              'sort_order', d.sort_order
            )
            order by d.sort_order
          )
          from days d
          where d.trip_id = t.id
        ),
        '[]'::jsonb
      )
      else null
    end
  )
  from trips t
  where t.share_token = p_token
$$;

revoke all on function get_shared_trip_by_token(uuid) from public;
grant execute on function get_shared_trip_by_token(uuid) to anon, authenticated;

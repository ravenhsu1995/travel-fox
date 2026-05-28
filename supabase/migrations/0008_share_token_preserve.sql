-- Preserve share_token across unlisted ↔ public.
--
-- Invariant: share_token IS NULL ⟺ visibility = 'private'
--
-- Original behaviour (0007) cleared the token whenever the user switched
-- AWAY from unlisted (even when going to public). Public is a strict
-- superset of unlisted's access — promoting a trip from unlisted → public
-- should NOT kill the existing /s/[token] link, just expose the trip in
-- the gallery too. Same logic in reverse: demoting public → unlisted
-- keeps the same token.
--
-- Only switching to private (revocation) clears the token.

-- ────────────────────────────────────────────────────────────────────────
-- 1. update_trip_visibility — new token state machine
-- ────────────────────────────────────────────────────────────────────────

create or replace function update_trip_visibility(
  p_trip_id uuid,
  p_visibility text,
  p_public_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_current_token uuid;
  v_new_token uuid;
  v_clean_name text;
begin
  select owner_id, share_token
    into v_owner, v_current_token
    from trips where id = p_trip_id;

  if v_owner is null then
    raise exception 'trip not found';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'forbidden';
  end if;

  if p_visibility not in ('private', 'unlisted', 'public') then
    raise exception 'invalid visibility';
  end if;

  v_clean_name := nullif(trim(p_public_display_name), '');
  if v_clean_name is not null and char_length(v_clean_name) > 30 then
    raise exception 'display name too long';
  end if;

  -- Token state machine:
  --   any → private        : NULL
  --   any → unlisted/public : preserve existing, mint a new one if NULL
  if p_visibility = 'private' then
    v_new_token := null;
  else
    v_new_token := coalesce(v_current_token, gen_random_uuid());
  end if;

  update trips
    set visibility = p_visibility,
        share_token = v_new_token,
        public_display_name = case
          when p_visibility = 'public' then v_clean_name
          else public_display_name
        end
    where id = p_trip_id;

  return jsonb_build_object(
    'visibility', p_visibility,
    'share_token', v_new_token,
    'public_display_name', case
      when p_visibility = 'public' then v_clean_name
      else (select public_display_name from trips where id = p_trip_id)
    end
  );
end;
$$;

revoke all on function update_trip_visibility(uuid, text, text) from public;
grant execute on function update_trip_visibility(uuid, text, text) to authenticated;

-- ────────────────────────────────────────────────────────────────────────
-- 2. get_shared_trip_by_token — accept both unlisted and public
-- ────────────────────────────────────────────────────────────────────────
-- Safety: public trips are already readable via /samples and direct RLS,
-- so widening the RPC to return them doesn't leak anything new. The /s
-- page redirects public hits to /samples/[id] for the canonical URL.

create or replace function get_shared_trip_by_token(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'trip', jsonb_build_object(
      'id', t.id,
      'title', t.title,
      'subtitle', t.subtitle,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'cover_emoji', t.cover_emoji,
      'is_public_sample', t.is_public_sample,
      'visibility', t.visibility,
      'created_at', t.created_at
    ),
    'days', coalesce(
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
  )
  from trips t
  where t.share_token = p_token
    and t.visibility in ('unlisted', 'public')
$$;

revoke all on function get_shared_trip_by_token(uuid) from public;
grant execute on function get_shared_trip_by_token(uuid) to anon, authenticated;

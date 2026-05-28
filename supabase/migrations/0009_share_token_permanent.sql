-- Make share_token a permanent per-trip identifier.
--
-- Previous (0008) rule: switching to private cleared share_token, so the
-- existing /s/[token] URL died forever — even if the owner changed their
-- mind and re-opened the trip. Owners pushed back: setting private should
-- only *hide* the contents, not revoke the URL. Re-opening should restore
-- the same link.
--
-- New rule:
--   - share_token is minted lazily the first time a trip becomes
--     non-private and is preserved forever afterwards (including across
--     visibility = 'private').
--   - /s/[token] still resolves for private trips, but the page renders a
--     "this trip is now private" landing state instead of the itinerary.
--
-- Token uniqueness invariant (partial unique index) is untouched: every
-- non-null token is still unique.

-- ────────────────────────────────────────────────────────────────────────
-- 1. update_trip_visibility — token always preserved
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

  -- Token rule:
  --   private    : preserve whatever's there (may stay NULL if never shared)
  --   non-private: preserve existing, mint a new one if NULL (lazy first-mint)
  if p_visibility = 'private' then
    v_new_token := v_current_token;
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
-- 2. get_shared_trip_by_token — resolve for any visibility
-- ────────────────────────────────────────────────────────────────────────
-- Returns the trip's visibility for ALL valid tokens. Trip + day payload
-- is only filled in for non-private trips; private returns a marker the
-- /s/[token] page renders as a "this is now private" landing.

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
        'created_at', t.created_at
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

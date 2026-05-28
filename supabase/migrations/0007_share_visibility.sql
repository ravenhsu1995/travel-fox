-- Share-itinerary feature: YouTube-style three-tier visibility.
--   private   only owner sees
--   unlisted  link-only, viewable via /s/[token] (token == credential)
--   public    appears in /samples gallery, anyone may view
--
-- Critical: unlisted is NOT exposed via ordinary RLS — token validation runs
-- inside SECURITY DEFINER RPC so any-logged-in-user cannot enumerate
-- unlisted trips.

-- ────────────────────────────────────────────────────────────────────────
-- 1. Schema
-- ────────────────────────────────────────────────────────────────────────

alter table trips
  add column if not exists visibility text not null default 'private'
    check (visibility in ('public', 'unlisted', 'private')),
  add column if not exists share_token uuid,
  add column if not exists public_display_name text
    check (public_display_name is null or char_length(public_display_name) <= 30);

create unique index if not exists trips_share_token_unique
  on trips (share_token) where share_token is not null;

-- ────────────────────────────────────────────────────────────────────────
-- 2. RLS — trips: owner OR public OR public_sample (unlisted excluded)
-- ────────────────────────────────────────────────────────────────────────

drop policy if exists "read own or public trip" on trips;
create policy "read own or public trip" on trips
  for select using (
    auth.uid() = owner_id
    or is_public_sample = true
    or visibility = 'public'
  );

-- ────────────────────────────────────────────────────────────────────────
-- 3. RLS — days: mirror trips visibility (unlisted excluded here too)
-- ────────────────────────────────────────────────────────────────────────

drop policy if exists "read days of accessible trip" on days;
create policy "read days of accessible trip" on days
  for select using (
    exists (
      select 1 from trips t
      where t.id = days.trip_id
        and (
          t.owner_id = auth.uid()
          or t.is_public_sample = true
          or t.visibility = 'public'
        )
    )
  );

-- ────────────────────────────────────────────────────────────────────────
-- 4. RLS — expenses: tighten to owner-only (don't leak with public trips)
-- ────────────────────────────────────────────────────────────────────────

drop policy if exists "read expenses of accessible trip" on expenses;
create policy "read expenses of accessible trip" on expenses
  for select using (
    exists (
      select 1 from trips t
      where t.id = expenses.trip_id
        and t.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────
-- 5. RPC — get_shared_trip_by_token (whitelist columns, no owner_id/token)
-- ────────────────────────────────────────────────────────────────────────

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
    and t.visibility = 'unlisted'
$$;

revoke all on function get_shared_trip_by_token(uuid) from public;
grant execute on function get_shared_trip_by_token(uuid) to anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────
-- 6. RPC — update_trip_visibility (atomic state machine for owner)
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
  v_current_visibility text;
  v_current_token uuid;
  v_new_token uuid;
  v_clean_name text;
begin
  select owner_id, visibility, share_token
    into v_owner, v_current_visibility, v_current_token
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

  -- share_token state machine
  if p_visibility = 'unlisted' then
    if v_current_visibility = 'unlisted' then
      v_new_token := v_current_token;  -- idempotent: keep existing link alive
    else
      v_new_token := gen_random_uuid();  -- fresh token, old links dead
    end if;
  else
    v_new_token := null;  -- private / public both clear token
  end if;

  update trips
    set visibility = p_visibility,
        share_token = v_new_token,
        -- name only overwritten when switching INTO public; preserved otherwise
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
-- 7. Seed update — 2026 關西行 becomes public with display name "芒果狐狸"
-- ────────────────────────────────────────────────────────────────────────

update trips
  set visibility = 'public',
      public_display_name = '芒果狐狸'
  where id = '00000000-0000-0000-0000-000000000001';

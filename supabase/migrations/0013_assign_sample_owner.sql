-- Assign the public sample trip (2026 關西行) to ravenhsu1995@gmail.com so she
-- can edit it and rate timeline items. Also normalize visibility/display
-- name (matching its "still pinned as public sample" reality) and reset
-- any rating/comment fields on timeline items — the feedback feature was
-- added after the sample was seeded, so the sample should start clean.
--
-- Idempotent: re-running has no harmful effect.

do $$
declare
  v_owner uuid;
  v_day   record;
  v_cleaned jsonb;
begin
  select id into v_owner
  from auth.users
  where lower(email) = 'ravenhsu1995@gmail.com'
  limit 1;

  if v_owner is null then
    raise notice 'ravenhsu1995@gmail.com not found in auth.users; skipping owner assignment.';
    return;
  end if;

  update trips
  set owner_id = v_owner,
      visibility = 'public',
      public_display_name = coalesce(public_display_name, '芒果狐狸'),
      share_show_feedback = false
  where id = '00000000-0000-0000-0000-000000000001';

  for v_day in
    select id, timeline from days
    where trip_id = '00000000-0000-0000-0000-000000000001'
  loop
    select coalesce(
      jsonb_agg((item - 'rating' - 'comment') order by ord),
      '[]'::jsonb
    )
    into v_cleaned
    from jsonb_array_elements(v_day.timeline) with ordinality as t(item, ord);

    update days set timeline = v_cleaned where id = v_day.id;
  end loop;
end $$;

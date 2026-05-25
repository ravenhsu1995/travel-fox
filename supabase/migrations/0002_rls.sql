-- RLS policies (Stage 2)

alter table trips enable row level security;
alter table days enable row level security;
alter table expenses enable row level security;

-- ─── trips ───
drop policy if exists "read own or public trip" on trips;
create policy "read own or public trip" on trips
  for select using (auth.uid() = owner_id or is_public_sample = true);

drop policy if exists "insert own trip" on trips;
create policy "insert own trip" on trips
  for insert with check (auth.uid() = owner_id);

drop policy if exists "update own trip" on trips;
create policy "update own trip" on trips
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "delete own trip" on trips;
create policy "delete own trip" on trips
  for delete using (auth.uid() = owner_id);

-- ─── days ───
drop policy if exists "read days of accessible trip" on days;
create policy "read days of accessible trip" on days
  for select using (
    exists (
      select 1 from trips t
      where t.id = days.trip_id
        and (t.owner_id = auth.uid() or t.is_public_sample = true)
    )
  );

drop policy if exists "write days of own trip" on days;
create policy "write days of own trip" on days
  for all using (
    exists (select 1 from trips t where t.id = days.trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = days.trip_id and t.owner_id = auth.uid())
  );

-- ─── expenses ───
drop policy if exists "read expenses of accessible trip" on expenses;
create policy "read expenses of accessible trip" on expenses
  for select using (
    exists (
      select 1 from trips t
      where t.id = expenses.trip_id
        and (t.owner_id = auth.uid() or t.is_public_sample = true)
    )
  );

drop policy if exists "write expenses of own trip" on expenses;
create policy "write expenses of own trip" on expenses
  for all using (
    exists (select 1 from trips t where t.id = expenses.trip_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from trips t where t.id = expenses.trip_id and t.owner_id = auth.uid())
  );

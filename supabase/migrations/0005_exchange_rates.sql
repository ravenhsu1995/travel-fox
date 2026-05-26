-- Exchange rates cache (Stage: multi-currency)
-- Stores daily-refreshed FX rates with TWD as base. Populated server-side
-- from open.er-api.com when no cached row is < 24h old.

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base text not null check (base = 'TWD'),
  rates jsonb not null,
  fetched_at timestamptz not null default now()
);

create index if not exists exchange_rates_fetched_at_idx
  on exchange_rates (fetched_at desc);

alter table exchange_rates enable row level security;

-- Public data: anyone (including anon) may read.
drop policy if exists "rates_public_read" on exchange_rates;
create policy "rates_public_read" on exchange_rates
  for select using (true);

-- Any authenticated user may refresh the cache (rates are public data).
drop policy if exists "rates_authenticated_insert" on exchange_rates;
create policy "rates_authenticated_insert" on exchange_rates
  for insert with check (auth.role() = 'authenticated');

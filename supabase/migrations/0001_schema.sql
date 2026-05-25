-- Travel App schema (Stage 2)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Trips
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  start_date date not null,
  end_date date not null,
  companions text[] not null default '{}',
  cover_emoji text default '🗾',
  is_public_sample boolean not null default false,
  created_at timestamptz default now()
);

-- Only one public sample trip is allowed.
create unique index if not exists trips_one_public_sample
  on trips ((true)) where is_public_sample = true;

create index if not exists trips_owner_idx on trips (owner_id);

-- Days
create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date not null,
  day_label text,
  theme text,
  hotel jsonb,
  risks text[] default '{}',
  timeline jsonb not null default '[]',
  sort_order int not null,
  unique (trip_id, date)
);

create index if not exists days_trip_sort_idx on days (trip_id, sort_order);

-- Expenses (personal, per trip)
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  description text not null,
  amount numeric not null,
  currency text not null check (currency in ('JPY','NTD','KRW','VND','USD','TWD','EUR')),
  category text not null,
  date text not null,
  created_at timestamptz default now()
);

create index if not exists expenses_trip_id_idx on expenses (trip_id);

-- Add an "excluded" flag to manual expenses so users can keep a record but
-- omit it from totals (e.g. souvenirs they don't want counted as travel cost).
alter table expenses
  add column if not exists excluded boolean not null default false;

-- Currency cleanup: align expenses.currency with the 8-value Currency enum
-- used in lib/types.ts (TWD/USD/CNY/NZD/JPY/EUR/GBP/CAD). Old codes
-- NTD/KRW/VND are removed: NTD becomes TWD, KRW and VND rows are deleted.

-- 1. Defensive cleanup of stray whitespace/case (in case any rogue rows exist).
update expenses set currency = upper(trim(currency));

-- 2. Unify NTD → TWD (they were the same currency; collapse to TWD).
update expenses set currency = 'TWD' where currency = 'NTD';

-- 3. Delete KRW / VND rows (dropped from supported list per user decision).
delete from expenses where currency in ('KRW', 'VND');

-- 4. Replace the CHECK constraint with the new 8-value list. The original
--    constraint name in 0001_schema.sql is the default Postgres-generated
--    `expenses_currency_check` (since the inline check was declared without
--    a CONSTRAINT name).
alter table expenses
  drop constraint if exists expenses_currency_check;

alter table expenses
  add constraint expenses_currency_check
  check (currency in ('TWD','USD','CNY','NZD','JPY','EUR','GBP','CAD'));

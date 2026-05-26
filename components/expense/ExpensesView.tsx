"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Currency, Day, Expense, Trip } from "@/lib/types";
import {
  CURRENCIES,
  CURRENCY_LABEL,
  CURRENCY_SYMBOL,
  convertCurrency,
  formatMoney,
  type ExchangeRates,
} from "@/lib/currency";
import {
  deriveExpensesFromTrip,
  manualFromExpense,
  uniqueCurrenciesUsed,
  type LegacyCostRow,
  type MergedExpense,
} from "@/lib/derive-expenses";
import {
  addExpense,
  deleteExpense,
} from "@/app/trips/[tripId]/expenses/actions";

const CATEGORIES = [
  "🚆 交通",
  "🏨 住宿",
  "🍽 餐飲",
  "✨ 體驗",
  "🛍 購物",
  "💊 其他",
];

function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(end);
  while (s.getTime() <= e.getTime()) {
    out.push(s.toISOString().slice(0, 10));
    s.setUTCDate(s.getUTCDate() + 1);
  }
  return out;
}

function fmtUpdatedAt(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

export default function ExpensesView({
  trip,
  days,
  initialExpenses,
  rates,
}: {
  trip: Trip;
  days: Day[];
  initialExpenses: Expense[];
  rates: ExchangeRates;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const dates = useMemo(
    () => ["行前", ...dateRange(trip.start_date, trip.end_date)],
    [trip.start_date, trip.end_date],
  );

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("TWD");
  const [category, setCategory] = useState(CATEGORIES[4]);
  const [date, setDate] = useState(dates[1] ?? "行前");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDesc("");
    setAmount("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!desc.trim()) return setError("請輸入描述");
    if (!Number.isFinite(amt) || amt <= 0) return setError("金額需為正數");

    startTransition(async () => {
      const r = await addExpense({
        trip_id: trip.id,
        description: desc.trim(),
        amount: amt,
        currency,
        category,
        date,
      });
      if (!r.ok) setError(r.error);
      else {
        reset();
        router.refresh();
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("刪除這筆？")) return;
    startTransition(async () => {
      const r = await deleteExpense(id);
      if (!r.ok) setError(r.error);
      else router.refresh();
    });
  }

  const { derived, legacy } = useMemo(
    () => deriveExpensesFromTrip(days),
    [days],
  );

  const merged: MergedExpense[] = useMemo(
    () => [...derived, ...initialExpenses.map(manualFromExpense)],
    [derived, initialExpenses],
  );

  const availableCurrencies = useMemo<Currency[]>(() => {
    const used = new Set<Currency>(uniqueCurrenciesUsed(merged));
    used.add("TWD");
    // Preserve canonical order from CURRENCIES.
    return CURRENCIES.filter((c) => used.has(c));
  }, [merged]);

  const [displayCurrency, setDisplayCurrency] = useState<Currency>("TWD");

  // Group expenses with "行前" first, then trip dates in chronological order.
  const byDate = useMemo(() => {
    const m = new Map<string, MergedExpense[]>();
    for (const e of merged) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    const order = (d: string) => (d === "行前" ? "" : d);
    return Array.from(m.entries()).sort((a, b) =>
      order(a[0]).localeCompare(order(b[0])),
    );
  }, [merged]);

  const grandTotal = useMemo(
    () =>
      merged.reduce(
        (sum, e) =>
          sum + convertCurrency(e.amount, e.currency, displayCurrency, rates.rates),
        0,
      ),
    [merged, displayCurrency, rates.rates],
  );

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pt-4 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/trips/${trip.id}`}
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← {trip.title}
        </Link>
      </div>

      <section className="mb-3 rounded-xl bg-navy p-5 text-white shadow-md">
        <div className="flex items-center justify-between text-xs opacity-70">
          <span>行程總花費</span>
          <span className="text-[10px] opacity-80">
            即時匯率 · {fmtUpdatedAt(rates.fetched_at)}
            {rates.source === "fallback" && "（離線）"}
          </span>
        </div>
        <div className="mt-1 text-3xl font-extrabold">
          {formatMoney(grandTotal, displayCurrency)}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] opacity-70">顯示幣別：</span>
          {availableCurrencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setDisplayCurrency(c)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                c === displayCurrency
                  ? "bg-white text-navy shadow-sm"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              {CURRENCY_SYMBOL[c]} {c}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={onSubmit} className="mb-5 space-y-2 rounded-xl bg-card p-4 shadow-sm">
        <div className="mb-1 text-sm font-bold text-navy">＋ 記錄額外花費</div>
        <div className="text-[11px] text-muted">
          行程內的交通／餐飲／體驗／住宿花費會自動加入；這裡只記錄行程外的支出（購物、藥品等）。
        </div>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="說明（例：藥妝店採購）"
          className="h-11 w-full rounded-md border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額"
            className="h-11 w-full rounded-md border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="h-11 w-full rounded-md border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {CURRENCY_SYMBOL[c]} {c} {CURRENCY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-md border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-md border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-md bg-gold text-sm font-semibold text-white shadow-sm hover:bg-gold-lt disabled:opacity-50"
        >
          {pending ? "處理中…" : "新增"}
        </button>
      </form>

      {byDate.length === 0 && legacy.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-2 bg-card p-6 text-center text-sm text-muted">
          還沒有花費記錄
        </div>
      ) : (
        <div className="space-y-4">
          {byDate.map(([d, items]) => {
            const dayTotal = items.reduce(
              (s, e) =>
                s + convertCurrency(e.amount, e.currency, displayCurrency, rates.rates),
              0,
            );
            return (
              <section key={d}>
                <header className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-ink-2">{d}</span>
                  <span className="text-muted">
                    {formatMoney(dayTotal, displayCurrency)}
                  </span>
                </header>
                <ul className="space-y-1.5">
                  {items.map((e) => (
                    <ExpenseRow
                      key={e.key}
                      row={e}
                      displayCurrency={displayCurrency}
                      rates={rates}
                      tripId={trip.id}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </section>
            );
          })}

          {legacy.length > 0 && (
            <LegacySection tripId={trip.id} legacy={legacy} />
          )}
        </div>
      )}
    </main>
  );
}

function ExpenseRow({
  row,
  displayCurrency,
  rates,
  tripId,
  onDelete,
}: {
  row: MergedExpense;
  displayCurrency: Currency;
  rates: ExchangeRates;
  tripId: string;
  onDelete: (id: string) => void;
}) {
  const converted = convertCurrency(
    row.amount,
    row.currency,
    displayCurrency,
    rates.rates,
  );
  const wasConverted = row.currency !== displayCurrency;

  const sharedClass =
    "flex items-center gap-3 rounded-lg bg-card-pure p-3 shadow-xs";

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink">
          {row.description}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>{row.category}</span>
          {row.kind === "derived" && (
            <span className="rounded-full bg-info/10 px-1.5 py-0.5 text-[9px] font-bold text-info">
              🔗 行程連動
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-right">
        {wasConverted && (
          <span
            className="text-xs text-muted"
            title={`原始輸入：${formatMoney(row.amount, row.currency)} ${row.currency}`}
          >
            🔄
          </span>
        )}
        <div className="text-sm font-bold text-ink">
          {formatMoney(converted, displayCurrency)}
        </div>
      </div>
    </>
  );

  if (row.kind === "derived") {
    return (
      <li>
        <Link
          href={`/trips/${tripId}/edit?day=${row.sourceDayId}`}
          className={`${sharedClass} hover:bg-bg-2`}
        >
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className={sharedClass}>
      {inner}
      <button
        onClick={() => onDelete(row.expenseId)}
        className="ml-1 text-muted hover:text-danger"
        aria-label="刪除"
      >
        ×
      </button>
    </li>
  );
}

function LegacySection({
  tripId,
  legacy,
}: {
  tripId: string;
  legacy: LegacyCostRow[];
}) {
  return (
    <section>
      <header className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-warning">⚠️ 需更新幣別</span>
        <span className="text-[10px] text-muted">
          這些項目是舊版純文字費用，無法計入總額
        </span>
      </header>
      <ul className="space-y-1.5">
        {legacy.map((row) => (
          <li key={row.key}>
            <Link
              href={`/trips/${tripId}/edit?day=${row.sourceDayId}`}
              className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3 shadow-xs hover:bg-warning/10"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">
                  {row.description}
                </div>
                <div className="text-[11px] text-muted">
                  {row.date} · 原資料「{row.legacy}」
                </div>
              </div>
              <div className="shrink-0 text-[11px] font-semibold text-warning">
                編輯 →
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

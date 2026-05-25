"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Currency, Expense, Trip } from "@/lib/types";
import { formatMoney, toNTD, CURRENCY_SYMBOL } from "@/lib/currency";
import {
  addExpense,
  deleteExpense,
  updateExpense,
} from "@/app/trips/[tripId]/expenses/actions";

const CATEGORIES = [
  "🚆 交通",
  "🏨 住宿",
  "🍽 餐飲",
  "✨ 體驗",
  "🛍 購物",
  "💊 其他",
];

const CURRENCIES: Currency[] = ["JPY", "NTD", "KRW", "VND", "USD", "EUR"];

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

export default function ExpensesView({
  trip,
  initialExpenses,
}: {
  trip: Trip;
  initialExpenses: Expense[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const dates = useMemo(
    () => ["行前", ...dateRange(trip.start_date, trip.end_date)],
    [trip.start_date, trip.end_date],
  );

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [category, setCategory] = useState(CATEGORIES[2]);
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

  // Total in NTD
  const totalNTD = useMemo(
    () =>
      initialExpenses.reduce(
        (sum, e) => sum + toNTD(Number(e.amount), e.currency),
        0,
      ),
    [initialExpenses],
  );

  // Group by currency for breakdown
  const byCurrency = useMemo(() => {
    const m = new Map<Currency, number>();
    for (const e of initialExpenses) {
      m.set(e.currency, (m.get(e.currency) ?? 0) + Number(e.amount));
    }
    return Array.from(m.entries());
  }, [initialExpenses]);

  // Group by date (desc)
  const byDate = useMemo(() => {
    const m = new Map<string, Expense[]>();
    for (const e of initialExpenses) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    const order = (d: string) => (d === "行前" ? "0000-00-00" : d);
    return Array.from(m.entries()).sort((a, b) => order(b[0]).localeCompare(order(a[0])));
  }, [initialExpenses]);

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

      <section className="mb-5 rounded-xl bg-navy p-5 text-white shadow-md">
        <div className="text-xs opacity-70">行程總花費</div>
        <div className="mt-1 text-3xl font-extrabold">
          {formatMoney(totalNTD, "NTD")}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-80">
          {byCurrency.map(([cur, n]) => (
            <span key={cur}>
              {CURRENCY_SYMBOL[cur]}
              {n.toLocaleString("en-US")}
            </span>
          ))}
        </div>
      </section>

      <form onSubmit={onSubmit} className="mb-5 space-y-2 rounded-xl bg-card p-4 shadow-sm">
        <div className="mb-1 text-sm font-bold text-navy">＋ 記錄花費</div>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="說明（例：神戶牛鐵板燒）"
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
                {CURRENCY_SYMBOL[c]} {c}
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

      {byDate.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-2 bg-card p-6 text-center text-sm text-muted">
          還沒有花費記錄
        </div>
      ) : (
        <div className="space-y-4">
          {byDate.map(([d, items]) => {
            const dayTotal = items.reduce(
              (s, e) => s + toNTD(Number(e.amount), e.currency),
              0,
            );
            return (
              <section key={d}>
                <header className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-ink-2">{d}</span>
                  <span className="text-muted">
                    {formatMoney(dayTotal, "NTD")}
                  </span>
                </header>
                <ul className="space-y-1.5">
                  {items.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center gap-3 rounded-lg bg-card-pure p-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink">
                          {e.description}
                        </div>
                        <div className="text-[11px] text-muted">{e.category}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-ink">
                          {formatMoney(Number(e.amount), e.currency)}
                        </div>
                        {e.currency !== "NTD" && e.currency !== "TWD" && (
                          <div className="text-[10px] text-muted">
                            ≈ {formatMoney(toNTD(Number(e.amount), e.currency), "NTD")}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="text-muted hover:text-danger"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

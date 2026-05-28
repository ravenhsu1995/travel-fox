"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Currency, Day, Expense, Trip } from "@/lib/types";
import {
  CURRENCIES,
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
import type { DerivedExclusionTarget } from "@/app/trips/[tripId]/expenses/actions";
import { colorForCategory, tintForCategory } from "@/lib/expense-categories";
import SwipeableRow from "./SwipeableRow";
import ExpenseDonutChart, { type DonutSegment } from "./ExpenseDonutChart";
import ExpenseFormModal from "./ExpenseFormModal";

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
  const [, startTransition] = useTransition();

  const dates = useMemo(
    () => ["行前", ...dateRange(trip.start_date, trip.end_date)],
    [trip.start_date, trip.end_date],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local mirror of expenses so swipe actions (delete / exclude) reflect
  // instantly in the UI without waiting for a server roundtrip + revalidate.
  // When fresh server data arrives via props, resync during render — this is
  // the React-recommended "store info from previous renders" pattern, see
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [prevInitialExpenses, setPrevInitialExpenses] = useState(initialExpenses);
  if (prevInitialExpenses !== initialExpenses) {
    setPrevInitialExpenses(initialExpenses);
    setExpenses(initialExpenses);
  }

  // Optimistic overrides for derived rows (keyed by DerivedExpense.key).
  // Cleared whenever fresh days arrive from the server.
  const [derivedOverrides, setDerivedOverrides] = useState<
    Record<string, boolean>
  >({});
  const [prevDays, setPrevDays] = useState(days);
  if (prevDays !== days) {
    setPrevDays(days);
    setDerivedOverrides({});
  }

  async function readMutationResult(
    res: Response,
    fallback: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const data = (await res.json().catch(() => null)) as
      | { ok: true }
      | { ok: false; error?: string }
      | null;
    if (!res.ok || !data?.ok) {
      const err = data && data.ok === false ? data.error : undefined;
      return { ok: false, error: err ?? fallback };
    }
    return { ok: true };
  }

  function onDelete(id: string) {
    if (!confirm("刪除這筆？")) return;
    const snapshot = expenses;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}/expenses/${id}`, {
          method: "DELETE",
        });
        const r = await readMutationResult(res, "刪除失敗");
        if (!r.ok) {
          setError(r.error);
          setExpenses(snapshot);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "刪除失敗");
        setExpenses(snapshot);
      }
    });
  }

  function onToggleExcluded(id: string, next: boolean) {
    const snapshot = expenses;
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, excluded: next } : e)),
    );
    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}/expenses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ excluded: next }),
        });
        const r = await readMutationResult(res, "儲存失敗");
        if (!r.ok) {
          setError(r.error);
          setExpenses(snapshot);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "儲存失敗");
        setExpenses(snapshot);
      }
    });
  }

  function clearDerivedOverride(key: string) {
    setDerivedOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function onToggleDerivedExcluded(
    key: string,
    target: DerivedExclusionTarget,
    next: boolean,
  ) {
    setDerivedOverrides((prev) => ({ ...prev, [key]: next }));
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/trips/${trip.id}/expenses/derived`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dayId: target.dayId,
              kind: target.kind,
              index: target.kind === "timeline" ? target.index : undefined,
              excluded: next,
            }),
          },
        );
        const r = await readMutationResult(res, "儲存失敗");
        if (!r.ok) {
          setError(r.error);
          clearDerivedOverride(key);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "儲存失敗");
        clearDerivedOverride(key);
      }
    });
  }

  const { derived, legacy } = useMemo(
    () => deriveExpensesFromTrip(days),
    [days],
  );

  const merged: MergedExpense[] = useMemo(() => {
    const enriched = derived.map((d) =>
      d.key in derivedOverrides
        ? { ...d, excluded: derivedOverrides[d.key] }
        : d,
    );
    return [...enriched, ...expenses.map(manualFromExpense)];
  }, [derived, expenses, derivedOverrides]);

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
      merged.reduce((sum, e) => {
        if (e.excluded) return sum;
        return (
          sum + convertCurrency(e.amount, e.currency, displayCurrency, rates.rates)
        );
      }, 0),
    [merged, displayCurrency, rates.rates],
  );

  const donutSegments = useMemo<DonutSegment[]>(() => {
    const byCategory = new Map<string, number>();
    for (const e of merged) {
      if (e.excluded) continue;
      const converted = convertCurrency(
        e.amount,
        e.currency,
        displayCurrency,
        rates.rates,
      );
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + converted);
    }
    return Array.from(byCategory.entries()).map(([label, amount]) => ({
      label,
      amount,
      color: colorForCategory(label),
    }));
  }, [merged, displayCurrency, rates.rates]);

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pt-4 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/trips"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← 我的行程
        </Link>
      </div>

      <section className="mb-3 rounded-xl bg-navy p-5 text-white shadow-md">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">行程總花費</h2>
          <span className="text-[10px] text-white/70">
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

      <ExpenseDonutChart
        segments={donutSegments}
        displayCurrency={displayCurrency}
      />

      <section className="rounded-xl bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-navy">消費列表</h2>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="h-8 rounded-full bg-gold px-3 text-xs font-semibold text-white shadow-sm hover:bg-gold-lt"
          >
            ＋ 新增額外花費
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        {byDate.length === 0 && legacy.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">
            還沒有花費記錄
          </div>
        ) : (
          <div className="space-y-4">
            {byDate.map(([d, items]) => {
              const dayTotal = items.reduce((s, e) => {
                if (e.excluded) return s;
                return (
                  s + convertCurrency(e.amount, e.currency, displayCurrency, rates.rates)
                );
              }, 0);
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
                        onToggleExcluded={onToggleExcluded}
                        onToggleDerivedExcluded={onToggleDerivedExcluded}
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
      </section>

      {formOpen && (
        <ExpenseFormModal
          onClose={() => setFormOpen(false)}
          trip={trip}
          dates={dates}
          onSubmitted={() => {
            setFormOpen(false);
            router.refresh();
          }}
        />
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
  onToggleExcluded,
  onToggleDerivedExcluded,
}: {
  row: MergedExpense;
  displayCurrency: Currency;
  rates: ExchangeRates;
  tripId: string;
  onDelete: (id: string) => void;
  onToggleExcluded: (id: string, next: boolean) => void;
  onToggleDerivedExcluded: (
    key: string,
    target: DerivedExclusionTarget,
    next: boolean,
  ) => void;
}) {
  const converted = convertCurrency(
    row.amount,
    row.currency,
    displayCurrency,
    rates.rates,
  );
  const wasConverted = row.currency !== displayCurrency;
  const isExcluded = row.excluded;

  const sharedClass = "flex items-center gap-3 rounded-lg p-3 shadow-xs";
  const tintStyle = { backgroundColor: tintForCategory(row.category) };

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-sm font-semibold ${isExcluded ? "text-muted line-through" : "text-ink"}`}
        >
          {row.description}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>{row.category}</span>
          {row.kind === "derived" && (
            <span className="rounded-full bg-info/10 px-1.5 py-0.5 text-[9px] font-bold text-info">
              🔗
            </span>
          )}
          {isExcluded && (
            <span className="rounded-full bg-muted/15 px-1.5 py-0.5 text-[9px] font-bold text-muted">
              不列入
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
        <div
          className={`text-sm font-bold ${isExcluded ? "text-muted line-through" : "text-ink"}`}
        >
          {formatMoney(converted, displayCurrency)}
        </div>
      </div>
    </>
  );

  if (row.kind === "derived") {
    const target: DerivedExclusionTarget =
      row.sourceIndex === null
        ? { kind: "hotel", dayId: row.sourceDayId }
        : { kind: "timeline", dayId: row.sourceDayId, index: row.sourceIndex };
    return (
      <li>
        <SwipeableRow
          className="rounded-lg"
          actions={[
            {
              label: row.excluded ? "計入" : "不列入計算",
              bg: "bg-warning",
              onClick: () =>
                onToggleDerivedExcluded(row.key, target, !row.excluded),
            },
          ]}
        >
          <Link
            href={`/trips/${tripId}/edit?day=${row.sourceDayId}`}
            className={sharedClass}
            style={tintStyle}
          >
            {inner}
          </Link>
        </SwipeableRow>
      </li>
    );
  }

  return (
    <li>
      <SwipeableRow
        className="rounded-lg"
        actions={[
          {
            label: row.excluded ? "計入" : "不列入計算",
            bg: "bg-warning",
            onClick: () => onToggleExcluded(row.expenseId, !row.excluded),
          },
          {
            label: "刪除",
            bg: "bg-danger",
            onClick: () => onDelete(row.expenseId),
          },
        ]}
      >
        <div className={sharedClass} style={tintStyle}>
          {inner}
        </div>
      </SwipeableRow>
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

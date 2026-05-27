"use client";

import { useEffect, useState, useTransition } from "react";
import type { Currency, Trip } from "@/lib/types";
import {
  CURRENCIES,
  CURRENCY_LABEL,
  CURRENCY_SYMBOL,
} from "@/lib/currency";
import { CATEGORIES } from "@/lib/expense-categories";

// Parent gates mount via `{open && <ExpenseFormModal ... />}`, so this
// component is only alive while the modal is open. Form state resets
// naturally on each remount; no useEffect cleanup needed.
export default function ExpenseFormModal({
  onClose,
  trip,
  dates,
  onSubmitted,
}: {
  onClose: () => void;
  trip: Trip;
  dates: string[];
  onSubmitted: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("TWD");
  const [category, setCategory] = useState<string>(CATEGORIES[4]);
  const [date, setDate] = useState<string>(dates[1] ?? dates[0] ?? "行前");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!desc.trim()) return setError("請輸入描述");
    if (!Number.isFinite(amt) || amt <= 0) return setError("金額需為正數");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: desc.trim(),
            amount: amt,
            currency,
            category,
            date,
          }),
        });
        const data = (await res.json().catch(() => null)) as
          | { ok: true }
          | { ok: false; error?: string }
          | null;
        if (!res.ok || !data?.ok) {
          const err =
            data && data.ok === false ? data.error : undefined;
          setError(err ?? "新增失敗");
          return;
        }
        onSubmitted();
      } catch (err) {
        setError(err instanceof Error ? err.message : "新增失敗");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-[fadeIn_180ms_ease-out]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="新增額外花費"
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-2xl bg-card p-4 pb-6 shadow-lg animate-[slideUp_220ms_ease-out]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-2" />
        <div className="mb-1 text-sm font-bold text-navy">＋ 記錄額外花費</div>
        <div className="mb-3 text-[11px] text-muted">
          行程內的花費會自動加入；這裡只記錄行程外的支出（例如：購物）。
        </div>
        <form onSubmit={onSubmit} className="space-y-2">
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
                  {CURRENCY_SYMBOL[c]} {c} • {CURRENCY_LABEL[c]}
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
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full rounded-md border border-line-2 bg-card-pure text-sm font-semibold text-ink-2 hover:bg-bg-2"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-11 w-full rounded-md bg-gold text-sm font-semibold text-white shadow-sm hover:bg-gold-lt disabled:opacity-50"
            >
              {pending ? "處理中…" : "新增"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

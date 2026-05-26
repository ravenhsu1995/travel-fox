"use client";

import type { Currency } from "@/lib/types";
import { formatMoney } from "@/lib/currency";

export type DonutSegment = {
  label: string;
  amount: number;
  color: string;
};

const CENTER = 50;
const RADIUS = 34;
const STROKE_WIDTH = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ExpenseDonutChart({
  segments,
  displayCurrency,
}: {
  segments: DonutSegment[];
  displayCurrency: Currency;
}) {
  const filtered = segments.filter((s) => s.amount > 0);
  const total = filtered.reduce((sum, s) => sum + s.amount, 0);
  const sorted = [...filtered].sort((a, b) => b.amount - a.amount);

  if (total <= 0) {
    return (
      <section className="mb-3 rounded-xl bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-base font-bold text-navy">花費分布</h2>
        <div className="py-6 text-center text-sm text-muted">
          尚無花費可分析
        </div>
      </section>
    );
  }

  let accumulatedAngle = 0;

  return (
    <section className="mb-3 rounded-xl bg-card p-5 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-navy">花費分布</h2>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-44 w-44"
          role="img"
          aria-label="各類別花費比例"
        >
          {sorted.map((seg) => {
            const fraction = seg.amount / total;
            const arcLength = fraction * CIRCUMFERENCE;
            const startAngle = accumulatedAngle;
            accumulatedAngle += fraction * 360;
            return (
              <circle
                key={seg.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`}
                transform={`rotate(${startAngle - 90} ${CENTER} ${CENTER})`}
              />
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 space-y-2">
        {sorted.map((seg) => {
          const pct = Math.round((seg.amount / total) * 100);
          return (
            <li
              key={seg.label}
              className="flex items-center gap-2.5 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 truncate text-ink-2">{seg.label}</span>
              <span className="shrink-0 font-semibold text-ink">
                {formatMoney(seg.amount, displayCurrency)}
              </span>
              <span className="w-10 shrink-0 text-right text-xs text-muted tabular-nums">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

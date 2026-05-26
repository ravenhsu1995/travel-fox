import type { Currency, Day, Expense, TimelineItem } from "@/lib/types";

export type DerivedExpense = {
  kind: "derived";
  key: string;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string;
  sourceDayId: string;
  /** null for hotel-type (which lives outside the timeline array). */
  sourceIndex: number | null;
  itemType: "transport" | "meal" | "exp" | "hotel";
  excluded: boolean;
  legacy?: string;
};

export type ManualExpense = {
  kind: "manual";
  key: string;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string;
  expenseId: string;
  excluded: boolean;
};

export type MergedExpense = DerivedExpense | ManualExpense;

export type LegacyCostRow = {
  key: string;
  description: string;
  legacy: string;
  date: string;
  sourceDayId: string;
  itemType: "transport" | "meal" | "exp" | "hotel";
};

const CATEGORY = {
  transport: "🚆 交通",
  meal: "🍽 餐飲",
  exp: "✨ 體驗",
  hotel: "🏨 住宿",
} as const;

function transportDescription(t: NonNullable<TimelineItem["transport"]>): string {
  const route = [t.from, t.to].filter(Boolean).join(" → ");
  if (t.tool && route) return `${t.tool}：${route}`;
  return t.tool || route || "交通";
}

type DeriveResult = {
  derived: DerivedExpense[];
  legacy: LegacyCostRow[];
};

export function deriveExpensesFromTrip(days: Day[]): DeriveResult {
  const derived: DerivedExpense[] = [];
  const legacy: LegacyCostRow[] = [];

  for (const day of days) {
    // Hotel (only on the source day — multi-night hotels are stored only on
    // the first night and shadowed days carry hotel: null).
    if (day.hotel) {
      const h = day.hotel;
      const baseKey = `derived:hotel:${day.id}`;
      if (
        typeof h.costAmount === "number" &&
        h.costAmount > 0 &&
        h.costCurrency
      ) {
        derived.push({
          kind: "derived",
          key: baseKey,
          amount: h.costAmount,
          currency: h.costCurrency,
          category: CATEGORY.hotel,
          description: h.name || "住宿",
          date: day.date,
          sourceDayId: day.id,
          sourceIndex: null,
          itemType: "hotel",
          excluded: h.excluded ?? false,
        });
      } else if (h.cost) {
        legacy.push({
          key: `${baseKey}:legacy`,
          description: h.name || "住宿",
          legacy: h.cost,
          date: day.date,
          sourceDayId: day.id,
          itemType: "hotel",
        });
      }
    }

    for (let i = 0; i < day.timeline.length; i++) {
      const it = day.timeline[i];
      const baseKey = `derived:${day.id}:${i}:${it.type}`;

      if (it.type === "transport" && it.transport) {
        const t = it.transport;
        if (typeof t.costAmount === "number" && t.costAmount > 0 && t.costCurrency) {
          derived.push({
            kind: "derived",
            key: baseKey,
            amount: t.costAmount,
            currency: t.costCurrency,
            category: CATEGORY.transport,
            description: transportDescription(t),
            date: day.date,
            sourceDayId: day.id,
            sourceIndex: i,
            itemType: "transport",
            excluded: it.excluded ?? false,
          });
        } else if (t.cost) {
          legacy.push({
            key: `${baseKey}:legacy`,
            description: transportDescription(t),
            legacy: t.cost,
            date: day.date,
            sourceDayId: day.id,
            itemType: "transport",
          });
        }
      }

      if (it.type === "meal" && it.meal) {
        const m = it.meal;
        const desc = m.name || m.type || "餐飲";
        if (typeof m.costAmount === "number" && m.costAmount > 0 && m.costCurrency) {
          derived.push({
            kind: "derived",
            key: baseKey,
            amount: m.costAmount,
            currency: m.costCurrency,
            category: CATEGORY.meal,
            description: desc,
            date: day.date,
            sourceDayId: day.id,
            sourceIndex: i,
            itemType: "meal",
            excluded: it.excluded ?? false,
          });
        } else if (m.cost) {
          legacy.push({
            key: `${baseKey}:legacy`,
            description: desc,
            legacy: m.cost,
            date: day.date,
            sourceDayId: day.id,
            itemType: "meal",
          });
        }
      }

      if (it.type === "exp" && it.exp) {
        const e = it.exp;
        const desc = e.spot || e.headline || "體驗";
        if (typeof e.costAmount === "number" && e.costAmount > 0 && e.costCurrency) {
          derived.push({
            kind: "derived",
            key: baseKey,
            amount: e.costAmount,
            currency: e.costCurrency,
            category: CATEGORY.exp,
            description: desc,
            date: day.date,
            sourceDayId: day.id,
            sourceIndex: i,
            itemType: "exp",
            excluded: it.excluded ?? false,
          });
        } else if (e.cost) {
          legacy.push({
            key: `${baseKey}:legacy`,
            description: desc,
            legacy: e.cost,
            date: day.date,
            sourceDayId: day.id,
            itemType: "exp",
          });
        }
      }
    }
  }

  return { derived, legacy };
}

export function manualFromExpense(e: Expense): ManualExpense {
  return {
    kind: "manual",
    key: `manual:${e.id}`,
    amount: Number(e.amount),
    currency: e.currency,
    category: e.category,
    description: e.description,
    date: e.date,
    expenseId: e.id,
    excluded: e.excluded ?? false,
  };
}

export function uniqueCurrenciesUsed(rows: MergedExpense[]): Currency[] {
  const set = new Set<Currency>();
  for (const r of rows) set.add(r.currency);
  return Array.from(set);
}

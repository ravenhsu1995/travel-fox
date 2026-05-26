import type { Currency } from "./types";

export const CURRENCIES: Currency[] = [
  "TWD",
  "USD",
  "CNY",
  "NZD",
  "JPY",
  "EUR",
  "GBP",
  "CAD",
];

export const CURRENCY_LABEL: Record<Currency, string> = {
  TWD: "台幣",
  USD: "美金",
  CNY: "人民幣",
  NZD: "紐西蘭元",
  JPY: "日圓",
  EUR: "歐元",
  GBP: "英鎊",
  CAD: "加幣",
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  TWD: "NT$",
  USD: "$",
  CNY: "CN¥",
  NZD: "NZ$",
  JPY: "JP¥",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
};

// Offline fallback rates (1 unit of currency → TWD). Used only when both the
// live API and the cached rates in Supabase are unavailable. Approximate values
// as of 2026-05; update periodically.
export const FALLBACK_RATES_TO_TWD: Record<Currency, number> = {
  TWD: 1,
  USD: 32.5,
  CNY: 4.5,
  NZD: 19.0,
  JPY: 0.21,
  EUR: 35.0,
  GBP: 41.0,
  CAD: 23.5,
};

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  const rounded =
    currency === "JPY"
      ? Math.round(amount)
      : Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toLocaleString("en-US")}`;
}

export type RatesMap = Record<Currency, number>;

export type ExchangeRates = {
  base: Currency;
  rates: RatesMap;
  fetched_at: string;
  source: "live" | "cache" | "fallback";
};

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: RatesMap,
): number {
  if (from === to) return amount;
  const fromRate = rates[from] ?? FALLBACK_RATES_TO_TWD[from];
  const toRate = rates[to] ?? FALLBACK_RATES_TO_TWD[to];
  if (!fromRate || !toRate) return amount;
  const inTwd = amount * fromRate;
  return inTwd / toRate;
}

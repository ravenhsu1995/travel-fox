import type { Currency } from "./types";

// Approximate rates to NTD (TWD). For display only — not for transactions.
// Update as needed.
export const RATES_TO_NTD: Record<Currency, number> = {
  NTD: 1,
  TWD: 1,
  JPY: 0.21,
  KRW: 0.024,
  VND: 0.0013,
  USD: 32.5,
  EUR: 35.0,
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  NTD: "NT$",
  TWD: "NT$",
  JPY: "¥",
  KRW: "₩",
  VND: "₫",
  USD: "$",
  EUR: "€",
};

export function toNTD(amount: number, from: Currency): number {
  return amount * (RATES_TO_NTD[from] ?? 1);
}

export function formatMoney(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? "";
  const rounded =
    currency === "JPY" || currency === "KRW" || currency === "VND"
      ? Math.round(amount)
      : Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toLocaleString("en-US")}`;
}

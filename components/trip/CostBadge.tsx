import type { Currency } from "@/lib/types";
import { CURRENCY_SYMBOL, formatMoney } from "@/lib/currency";

type Props = {
  // Legacy free-text cost (e.g. "¥1,200/晚"). Used when no structured amount.
  value?: string;
  amount?: number;
  currency?: Currency;
};

export default function CostBadge({ value, amount, currency }: Props) {
  const hasStructured =
    typeof amount === "number" && Number.isFinite(amount) && !!currency;

  const symbol = currency ? CURRENCY_SYMBOL[currency] : "$";
  const display = hasStructured
    ? formatMoney(amount, currency).replace(symbol, "").trim()
    : (value ?? "");

  if (!hasStructured && !value) return null;

  return (
    <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-gold bg-[#fff2b8] px-2.5 py-1 text-[11px] font-extrabold text-[#9a6500] shadow-xs">
      <span className="inline-flex h-4 min-w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-white">
        {symbol}
      </span>
      <span className="break-words">{display}</span>
    </div>
  );
}

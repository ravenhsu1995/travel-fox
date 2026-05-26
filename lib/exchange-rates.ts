import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  CURRENCIES,
  FALLBACK_RATES_TO_TWD,
  type ExchangeRates,
  type RatesMap,
} from "@/lib/currency";

export type { ExchangeRates, RatesMap };

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const API_URL = "https://open.er-api.com/v6/latest/TWD";

type OpenErApiResponse = {
  result: "success" | "error";
  base_code: string;
  time_last_update_unix: number;
  rates: Record<string, number>;
};

function buildRatesMap(raw: Record<string, number>): RatesMap {
  // raw[X] = "1 TWD = X units of currency X"; we want
  // "1 unit of currency X = (1 / raw[X]) TWD"
  const out = {} as RatesMap;
  for (const cur of CURRENCIES) {
    if (cur === "TWD") {
      out.TWD = 1;
      continue;
    }
    const r = raw[cur];
    out[cur] = typeof r === "number" && r > 0 ? 1 / r : FALLBACK_RATES_TO_TWD[cur];
  }
  return out;
}

function fallbackResponse(): ExchangeRates {
  return {
    base: "TWD",
    rates: { ...FALLBACK_RATES_TO_TWD },
    fetched_at: new Date().toISOString(),
    source: "fallback",
  };
}

export async function getExchangeRates(): Promise<ExchangeRates> {
  const supabase = await createClient();

  const { data: cached } = await supabase
    .from("exchange_rates")
    .select("base, rates, fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cachedFresh =
    cached &&
    Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

  if (cachedFresh) {
    return {
      base: cached.base,
      rates: cached.rates as RatesMap,
      fetched_at: cached.fetched_at as string,
      source: "cache",
    };
  }

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`open.er-api.com returned ${res.status}`);
    const data = (await res.json()) as OpenErApiResponse;
    if (data.result !== "success") throw new Error("open.er-api.com error");

    const rates = buildRatesMap(data.rates);
    const fetched_at = new Date().toISOString();

    await supabase
      .from("exchange_rates")
      .insert({ base: "TWD", rates, fetched_at });

    return { base: "TWD", rates, fetched_at, source: "live" };
  } catch {
    if (cached) {
      return {
        base: cached.base,
        rates: cached.rates as RatesMap,
        fetched_at: cached.fetched_at as string,
        source: "cache",
      };
    }
    return fallbackResponse();
  }
}

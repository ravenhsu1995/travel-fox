"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(start);
  const e = new Date(end);
  while (s.getTime() <= e.getTime()) {
    out.push(s.toISOString().slice(0, 10));
    s.setUTCDate(s.getUTCDate() + 1);
  }
  return out;
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${month}/${day} (${weekdays[d.getDay()]})`;
}

export type CreateTripResult =
  | { ok: true; tripId: string }
  | { ok: false; error: string };

export async function createTrip(formData: FormData): Promise<CreateTripResult> {
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const emoji = String(formData.get("cover_emoji") ?? "🗺️").trim() || "🗺️";
  const start = String(formData.get("start_date") ?? "");
  const end = String(formData.get("end_date") ?? "");
  const companionsRaw = String(formData.get("companions") ?? "");
  const companions = companionsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (!title) return { ok: false, error: "請輸入行程標題" };
  if (!start || !end) return { ok: false, error: "請選擇起訖日期" };
  if (new Date(start) > new Date(end))
    return { ok: false, error: "結束日不能早於開始日" };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { ok: false, error: "請先登入" };

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .insert({
      owner_id: claims.claims.sub,
      title,
      subtitle,
      cover_emoji: emoji,
      start_date: start,
      end_date: end,
      companions,
    })
    .select()
    .single();

  if (tripErr || !trip) {
    return { ok: false, error: tripErr?.message ?? "建立失敗" };
  }

  const dates = eachDate(start, end);
  const dayRows = dates.map((date, i) => ({
    trip_id: trip.id,
    date,
    day_label: dayLabel(date),
    sort_order: i,
    timeline: [],
    risks: [],
  }));

  const { error: daysErr } = await supabase.from("days").insert(dayRows);
  if (daysErr) {
    return { ok: false, error: daysErr.message };
  }

  redirect(`/trips/${trip.id}`);
}

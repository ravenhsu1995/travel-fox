"use server";

import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import { normalizeJoinedLocationChips } from "@/lib/location-chips";

function getJwtSubject(jwt: string): string | null {
  const payload = jwt.split(".")[1];
  if (!payload) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return typeof parsed.sub === "string" ? parsed.sub : null;
  } catch {
    return null;
  }
}

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

type InsertedTrip = {
  id: string;
};

export async function createTrip(formData: FormData): Promise<CreateTripResult> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const subtitle = normalizeJoinedLocationChips(
      String(formData.get("subtitle") ?? ""),
    );
    const emoji = String(formData.get("cover_emoji") ?? "🗺️").trim() || "🗺️";
    const start = String(formData.get("start_date") ?? "");
    const end = String(formData.get("end_date") ?? "");
    if (!title) return { ok: false, error: "請輸入行程標題" };
    if (!start || !end) return { ok: false, error: "請選擇起訖日期" };
    if (new Date(start) > new Date(end))
      return { ok: false, error: "結束日不能早於開始日" };

    const jwt = await getAccessToken();
    if (!jwt) return { ok: false, error: "請先登入" };

    const ownerId = getJwtSubject(jwt);
    if (!ownerId) return { ok: false, error: "無法確認登入身分" };

    const tripResult = await pgrest<InsertedTrip[]>({
      method: "POST",
      path: "/rest/v1/trips?select=id",
      jwt,
      returnRow: true,
      body: {
        owner_id: ownerId,
        title,
        subtitle,
        cover_emoji: emoji,
        start_date: start,
        end_date: end,
      },
    });
    if (!tripResult.ok) return { ok: false, error: tripResult.error };

    const trip = tripResult.data?.[0];
    if (!trip?.id) return { ok: false, error: "建立成功但無法取得行程 ID" };

    const dates = eachDate(start, end);
    const dayRows = dates.map((date, i) => ({
      trip_id: trip.id,
      date,
      day_label: dayLabel(date),
      sort_order: i,
      timeline: [],
    }));

    const daysResult = await pgrest({
      method: "POST",
      path: "/rest/v1/days?select=id",
      jwt,
      returnRow: true,
      body: dayRows,
    });
    if (!daysResult.ok) {
      await pgrest({
        method: "DELETE",
        path: `/rest/v1/trips?id=eq.${trip.id}`,
        jwt,
      });
      return { ok: false, error: daysResult.error };
    }

    return { ok: true, tripId: trip.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `建立失敗：${msg}` };
  }
}

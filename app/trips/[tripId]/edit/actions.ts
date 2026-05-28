"use server";

import { getAccessToken, pgrest } from "@/lib/supabase/rest";
import type { Day, HotelInfo, TimelineItem, Trip } from "@/lib/types";
import { normalizeJoinedLocationChips } from "@/lib/location-chips";

// NOTE: All mutations here use direct PostgREST fetch (via @/lib/supabase/rest)
// instead of the @supabase/ssr SDK. Going through the SDK can trigger
// cookies().set() during auth refresh, which Next.js treats as "the action
// mutated state" and tries to re-render the current page in the action
// response — that re-render has been the source of repeated
// "An error occurred in the Server Components render" failures.

type SaveTripPayload = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_emoji: string;
  start_date: string;
  end_date: string;
};

type SaveDayPayload = {
  id: string;
  trip_id: string;
  theme: string | null;
  hotel: HotelInfo | null;
  timeline: TimelineItem[];
};

export async function saveTrip(payload: SaveTripPayload) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) return { ok: false, error: "未登入" } as const;

    const result = await pgrest({
      method: "PATCH",
      path: `/rest/v1/trips?id=eq.${payload.id}`,
      jwt,
      body: {
        title: payload.title,
        subtitle: normalizeJoinedLocationChips(payload.subtitle),
        cover_emoji: payload.cover_emoji,
        start_date: payload.start_date,
        end_date: payload.end_date,
      },
    });
    if (!result.ok) return { ok: false, error: result.error } as const;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export async function saveDay(payload: SaveDayPayload) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) return { ok: false, error: "未登入" } as const;

    const result = await pgrest({
      method: "PATCH",
      path: `/rest/v1/days?id=eq.${payload.id}`,
      jwt,
      body: {
        theme: normalizeJoinedLocationChips(payload.theme, " • "),
        hotel: payload.hotel,
        timeline: payload.timeline,
      },
    });
    if (!result.ok) return { ok: false, error: result.error } as const;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export async function deleteTrip(tripId: string) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) return { ok: false, error: "未登入" } as const;

    const result = await pgrest({
      method: "DELETE",
      path: `/rest/v1/trips?id=eq.${tripId}`,
      jwt,
    });
    if (!result.ok) return { ok: false, error: result.error } as const;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export async function addDay(
  tripId: string,
  position: "before" | "after",
  relativeToDayId: string,
) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) return { ok: false as const, error: "未登入" };

    // Fetch all days to determine sort_orders and dates
    const fetchResult = await pgrest<Array<{ id: string; date: string; sort_order: number }>>({
      method: "GET",
      path: `/rest/v1/days?select=id,date,sort_order&trip_id=eq.${tripId}&order=sort_order`,
      jwt,
    });
    if (!fetchResult.ok) return { ok: false as const, error: fetchResult.error };
    const allDays = fetchResult.data ?? [];

    const refDay = allDays.find((d) => d.id === relativeToDayId);
    if (!refDay && allDays.length > 0)
      return { ok: false as const, error: "找不到參考日" };

    // Calculate new date using local-time parts to avoid UTC-offset issues
    const refDate = refDay
      ? new Date(refDay.date + "T00:00:00")
      : new Date();
    const newDate = new Date(refDate);
    newDate.setDate(newDate.getDate() + (position === "after" ? 1 : -1));
    const yr = newDate.getFullYear();
    const mo = String(newDate.getMonth() + 1).padStart(2, "0");
    const dy = String(newDate.getDate()).padStart(2, "0");
    const newDateStr = `${yr}-${mo}-${dy}`;

    if (allDays.some((d) => d.date === newDateStr))
      return { ok: false as const, error: `${newDateStr} 已存在，無法重複新增` };

    const newSortOrder =
      position === "after"
        ? (refDay?.sort_order ?? -1) + 1
        : (refDay?.sort_order ?? 0);

    const toShift = allDays.filter((d) =>
      position === "after"
        ? d.sort_order > (refDay?.sort_order ?? -1)
        : d.sort_order >= (refDay?.sort_order ?? 0),
    );
    for (const d of toShift) {
      const shiftResult = await pgrest({
        method: "PATCH",
        path: `/rest/v1/days?id=eq.${d.id}`,
        jwt,
        body: { sort_order: d.sort_order + 1 },
      });
      if (!shiftResult.ok)
        return { ok: false as const, error: shiftResult.error };
    }

    const weekday = ["日", "一", "二", "三", "四", "五", "六"][newDate.getDay()];
    const dayLabel = `${newDate.getMonth() + 1}/${newDate.getDate()} (${weekday})`;

    const insertResult = await pgrest<Array<{ id: string }>>({
      method: "POST",
      path: `/rest/v1/days?select=id`,
      jwt,
      returnRow: true,
      body: {
        trip_id: tripId,
        date: newDateStr,
        day_label: dayLabel,
        theme: null,
        hotel: null,
        timeline: [],
        sort_order: newSortOrder,
      },
    });
    if (!insertResult.ok)
      return { ok: false as const, error: insertResult.error };

    const insertedId = insertResult.data?.[0]?.id;
    if (!insertedId)
      return { ok: false as const, error: "新增成功但無法取得 ID" };

    const newDay: Day = {
      id: insertedId,
      trip_id: tripId,
      date: newDateStr,
      day_label: dayLabel,
      theme: null,
      hotel: null,
      timeline: [],
      sort_order: newSortOrder,
    };

    return { ok: true as const, day: newDay };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false as const, error: `新增失敗：${msg}` };
  }
}

export async function deleteDay(dayId: string, tripId: string) {
  try {
    const jwt = await getAccessToken();
    if (!jwt) return { ok: false, error: "未登入" } as const;

    const result = await pgrest({
      method: "DELETE",
      path: `/rest/v1/days?id=eq.${dayId}`,
      jwt,
    });
    if (!result.ok) return { ok: false, error: result.error } as const;
    // tripId is unused now but kept for API compatibility with callers
    void tripId;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export type { SaveTripPayload, SaveDayPayload, Trip, Day };

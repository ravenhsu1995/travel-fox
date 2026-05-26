"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Day, HotelInfo, TimelineItem, Trip } from "@/lib/types";

// NOTE: revalidatePath() is intentionally NOT called inside saveTrip / saveDay.
// Both are invoked from startTransition; revalidatePath causes Next.js to
// re-render Server Components mid-transition, which throws and crashes the page.
// All pages in this app are dynamic (ƒ) so they are already fetched fresh on
// every navigation — the Router Cache is not involved.

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
    const supabase = await createClient();
    const { error } = await supabase
      .from("trips")
      .update({
        title: payload.title,
        subtitle: payload.subtitle,
        cover_emoji: payload.cover_emoji,
        start_date: payload.start_date,
        end_date: payload.end_date,
      })
      .eq("id", payload.id);

    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export async function saveDay(payload: SaveDayPayload) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("days")
      .update({
        theme: payload.theme,
        hotel: payload.hotel,
        timeline: payload.timeline,
      })
      .eq("id", payload.id);

    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg } as const;
  }
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) return { ok: false, error: error.message } as const;
  revalidatePath("/trips");
  return { ok: true } as const;
}

export async function addDay(
  tripId: string,
  position: "before" | "after",
  relativeToDayId: string,
) {
  try {
    const supabase = await createClient();

    // Fetch all days to determine sort_orders and dates
    const { data: allDays, error: e1 } = await supabase
      .from("days")
      .select("id, date, sort_order")
      .eq("trip_id", tripId)
      .order("sort_order");
    if (e1) return { ok: false as const, error: e1.message };

    const refDay = (allDays ?? []).find((d) => d.id === relativeToDayId);
    if (!refDay && (allDays ?? []).length > 0)
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

    // Check uniqueness
    if ((allDays ?? []).some((d) => d.date === newDateStr))
      return { ok: false as const, error: `${newDateStr} 已存在，無法重複新增` };

    // Determine new sort_order and shift existing days
    const newSortOrder =
      position === "after"
        ? (refDay?.sort_order ?? -1) + 1
        : (refDay?.sort_order ?? 0);

    const toShift = (allDays ?? []).filter((d) =>
      position === "after"
        ? d.sort_order > (refDay?.sort_order ?? -1)
        : d.sort_order >= (refDay?.sort_order ?? 0),
    );
    for (const d of toShift) {
      await supabase
        .from("days")
        .update({ sort_order: d.sort_order + 1 })
        .eq("id", d.id);
    }

    // Build day label
    const weekday = ["日", "一", "二", "三", "四", "五", "六"][newDate.getDay()];
    const dayLabel = `${newDate.getMonth() + 1}/${newDate.getDate()} (${weekday})`;

    // Insert and return only the generated id — build the Day object locally
    // to avoid serialisation issues with extra DB columns (e.g. risks text[]).
    const { data: row, error: e2 } = await supabase
      .from("days")
      .insert({
        trip_id: tripId,
        date: newDateStr,
        day_label: dayLabel,
        theme: null,
        hotel: null,
        timeline: [],
        sort_order: newSortOrder,
      })
      .select("id")
      .single();
    if (e2) return { ok: false as const, error: e2.message };

    const newDay: Day = {
      id: row.id,
      trip_id: tripId,
      date: newDateStr,
      day_label: dayLabel,
      theme: null,
      hotel: null,
      timeline: [],
      sort_order: newSortOrder,
    };

    revalidatePath(`/trips/${tripId}`);
    return { ok: true as const, day: newDay };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false as const, error: `新增失敗：${msg}` };
  }
}

export async function deleteDay(dayId: string, tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("days").delete().eq("id", dayId);
  if (error) return { ok: false, error: error.message } as const;
  revalidatePath(`/trips/${tripId}`);
  return { ok: true } as const;
}

export type { SaveTripPayload, SaveDayPayload, Trip, Day };

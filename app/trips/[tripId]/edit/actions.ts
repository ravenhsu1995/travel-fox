"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Day, HotelInfo, TimelineItem, Trip } from "@/lib/types";

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

  revalidatePath(`/trips/${payload.id}`);
  revalidatePath(`/trips/${payload.id}/edit`);
  revalidatePath("/trips");
  return { ok: true } as const;
}

export async function saveDay(payload: SaveDayPayload) {
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

  revalidatePath(`/trips/${payload.trip_id}`);
  revalidatePath(`/trips/${payload.trip_id}/edit`);
  return { ok: true } as const;
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) return { ok: false, error: error.message } as const;
  revalidatePath("/trips");
  return { ok: true } as const;
}

export async function addDay(tripId: string) {
  const supabase = await createClient();
  const { data: existing, error: e1 } = await supabase
    .from("days")
    .select("date, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (e1) return { ok: false as const, error: e1.message };

  const last = existing?.[0];
  const nextDate = last
    ? new Date(new Date(last.date).getTime() + 86_400_000)
        .toISOString()
        .slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const nextSort = (last?.sort_order ?? -1) + 1;

  const [y, m, d] = nextDate.split("-");
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][
    new Date(nextDate).getDay()
  ];
  const dayLabel = `${+m}/${+d} (${weekday})`;

  const { data: inserted, error: e2 } = await supabase
    .from("days")
    .insert({
      trip_id: tripId,
      date: nextDate,
      day_label: dayLabel,
      theme: null,
      hotel: null,
      timeline: [],
      sort_order: nextSort,
    })
    .select("id")
    .single();
  if (e2) return { ok: false as const, error: e2.message };

  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/edit`);
  return { ok: true as const, dayId: inserted.id, date: nextDate };
}

export async function deleteDay(dayId: string, tripId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("days").delete().eq("id", dayId);
  if (error) return { ok: false, error: error.message } as const;
  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/edit`);
  return { ok: true } as const;
}

export type { SaveTripPayload, SaveDayPayload, Trip, Day };

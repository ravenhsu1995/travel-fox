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
  companions: string[];
};

type SaveDayPayload = {
  id: string;
  trip_id: string;
  theme: string | null;
  hotel: HotelInfo | null;
  risks: string[];
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
      companions: payload.companions,
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
      risks: payload.risks,
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

export type { SaveTripPayload, SaveDayPayload, Trip, Day };

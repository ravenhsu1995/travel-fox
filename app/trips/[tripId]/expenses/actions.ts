"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Currency, HotelInfo, TimelineItem } from "@/lib/types";

type AddPayload = {
  trip_id: string;
  description: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string;
};

export async function addExpense(p: AddPayload) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert(p);
  if (error) return { ok: false, error: error.message } as const;
  revalidatePath(`/trips/${p.trip_id}/expenses`);
  return { ok: true } as const;
}

export async function updateExpense(
  id: string,
  patch: Partial<AddPayload>,
) {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select("trip_id")
    .single();
  if (error) return { ok: false, error: error.message } as const;
  if (data) revalidatePath(`/trips/${data.trip_id}/expenses`);
  return { ok: true } as const;
}

export async function setExpenseExcluded(id: string, excluded: boolean) {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("expenses")
    .update({ excluded })
    .eq("id", id)
    .select("trip_id")
    .single();
  if (error) return { ok: false, error: error.message } as const;
  if (data) revalidatePath(`/trips/${data.trip_id}/expenses`);
  return { ok: true } as const;
}

export type DerivedExclusionTarget =
  | { kind: "hotel"; dayId: string }
  | { kind: "timeline"; dayId: string; index: number };

export async function setDerivedExcluded(
  target: DerivedExclusionTarget,
  excluded: boolean,
) {
  const supabase = await createClient();
  const { data: day, error: fetchError } = await supabase
    .from("days")
    .select("trip_id, hotel, timeline")
    .eq("id", target.dayId)
    .single();
  if (fetchError || !day) {
    return { ok: false, error: fetchError?.message ?? "找不到日程" } as const;
  }

  let patch: { hotel?: HotelInfo | null; timeline?: TimelineItem[] };
  if (target.kind === "hotel") {
    const hotel = day.hotel as HotelInfo | null;
    if (!hotel) return { ok: false, error: "這天沒有住宿資料" } as const;
    patch = { hotel: { ...hotel, excluded } };
  } else {
    const timeline = (day.timeline as TimelineItem[] | null) ?? [];
    if (!timeline[target.index]) {
      return { ok: false, error: "找不到該行程項目" } as const;
    }
    const next = timeline.slice();
    next[target.index] = { ...next[target.index], excluded };
    patch = { timeline: next };
  }

  const { error: updateError } = await supabase
    .from("days")
    .update(patch)
    .eq("id", target.dayId);
  if (updateError) return { ok: false, error: updateError.message } as const;

  revalidatePath(`/trips/${day.trip_id}/expenses`);
  revalidatePath(`/trips/${day.trip_id}/edit`);
  return { ok: true } as const;
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .select("trip_id")
    .single();
  if (error) return { ok: false, error: error.message } as const;
  if (data) revalidatePath(`/trips/${data.trip_id}/expenses`);
  return { ok: true } as const;
}

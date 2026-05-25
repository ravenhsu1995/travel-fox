"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Currency } from "@/lib/types";

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

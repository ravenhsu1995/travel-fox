"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteTripFromList(
  tripId: string,
): Promise<{ ok: false; error: string } | { ok: true }> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return { ok: false, error: "未登入" };

  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("owner_id", claims.claims.sub); // 雙重保險：RLS + 明確 owner 條件

  if (error) return { ok: false, error: error.message };

  revalidatePath("/trips"); // 留在列表頁，重新整理資料
  return { ok: true };
}

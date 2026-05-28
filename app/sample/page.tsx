import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Legacy route. Points to the singleton public sample (2026 關西行); if for
// any reason that row is missing, fall back to the samples gallery so the
// home page entry never lands on a dead end.
export default async function SampleRedirect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select("id")
    .eq("is_public_sample", true)
    .maybeSingle<{ id: string }>();

  if (data?.id) redirect(`/samples/${data.id}`);
  redirect("/samples");
}

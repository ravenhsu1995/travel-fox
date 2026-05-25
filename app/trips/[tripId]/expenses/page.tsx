import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExpensesView from "@/components/expense/ExpensesView";
import type { Expense, Trip } from "@/lib/types";

export default async function ExpensesPage({
  params,
}: PageProps<"/trips/[tripId]/expenses">) {
  const { tripId } = await params;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect(`/login?redirect=/trips/${tripId}/expenses`);

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle<Trip>();
  if (!trip) notFound();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  return (
    <ExpensesView trip={trip} initialExpenses={(expenses ?? []) as Expense[]} />
  );
}

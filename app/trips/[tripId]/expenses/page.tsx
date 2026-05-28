import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserClaims } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import ExpensesView from "@/components/expense/ExpensesView";
import type { Day, Expense, Trip } from "@/lib/types";

export default async function ExpensesPage({
  params,
}: PageProps<"/trips/[tripId]/expenses">) {
  const { tripId } = await params;

  const supabase = await createClient();
  const claims = await getUserClaims();
  if (!claims) redirect(`/login?redirect=/trips/${tripId}/expenses`);

  const tripPromise = supabase
    .from("trips")
    .select("id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, share_token, public_display_name, share_show_feedback, created_at")
    .eq("id", tripId)
    .maybeSingle<Trip>();

  const daysPromise = supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });

  const expensesPromise = supabase
    .from("expenses")
    .select("id, trip_id, description, amount, currency, category, date, excluded, created_at")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  const ratesPromise = getExchangeRates();

  const { data: trip } = await tripPromise;
  if (!trip) notFound();
  if (trip.owner_id !== claims.sub) notFound();

  const [{ data: days }, { data: expenses }, rates] = await Promise.all([
    daysPromise,
    expensesPromise,
    ratesPromise,
  ]);

  return (
    <ExpensesView
      trip={trip}
      days={(days ?? []) as Day[]}
      initialExpenses={(expenses ?? []) as Expense[]}
      rates={rates}
    />
  );
}

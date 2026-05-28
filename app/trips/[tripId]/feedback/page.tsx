import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserClaims } from "@/lib/auth";
import TripFeedbackEditor from "@/components/trip/feedback/TripFeedbackEditor";
import type { Day, Trip } from "@/lib/types";

export default async function FeedbackPage({
  params,
}: PageProps<"/trips/[tripId]/feedback">) {
  const { tripId } = await params;
  const supabase = await createClient();
  const claims = await getUserClaims();
  if (!claims) redirect(`/login?redirect=/trips/${tripId}/feedback`);

  const tripPromise = supabase
    .from("trips")
    .select(
      "id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, share_token, public_display_name, share_show_feedback, created_at",
    )
    .eq("id", tripId)
    .maybeSingle<Trip>();

  const daysPromise = supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order");

  const { data: trip } = await tripPromise;
  if (!trip) notFound();
  if (trip.owner_id !== claims.sub) notFound();

  const { data: days } = await daysPromise;

  return (
    <TripFeedbackEditor
      initialTrip={trip}
      initialDays={(days ?? []) as Day[]}
    />
  );
}

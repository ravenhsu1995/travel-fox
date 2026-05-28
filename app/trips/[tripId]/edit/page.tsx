import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserClaims } from "@/lib/auth";
import TripEditor from "@/components/trip/editor/TripEditor";
import type { Day, Trip } from "@/lib/types";

export default async function EditTripPage({
  params,
  searchParams,
}: PageProps<"/trips/[tripId]/edit">) {
  const { tripId } = await params;
  const sp = await searchParams;
  const initialDayId = typeof sp.day === "string" ? sp.day : undefined;

  const supabase = await createClient();
  const claims = await getUserClaims();
  if (!claims) redirect(`/login?redirect=/trips/${tripId}/edit`);

  const tripPromise = supabase
    .from("trips")
    .select("id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, share_token, public_display_name, share_show_feedback, created_at")
    .eq("id", tripId)
    .maybeSingle<Trip>();

  const daysPromise = supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order");

  const { data: trip } = await tripPromise;
  if (!trip) notFound();
  if (trip.owner_id !== claims.sub) {
    if (trip.visibility === "public" || trip.is_public_sample) {
      redirect(`/samples/${trip.id}`);
    }
    notFound();
  }

  const { data: days } = await daysPromise;

  return (
    <TripEditor
      initialTrip={trip}
      initialDays={(days ?? []) as Day[]}
      initialDayId={initialDayId}
    />
  );
}

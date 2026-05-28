import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
import type { Day, TripForView } from "@/lib/types";

// RFC 4122 UUID format (any version). Guards against malformed input
// hitting the PostgREST `uuid` cast (which throws a 400 instead of nullable).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SharedTripPayload = {
  trip: TripForView;
  days: Day[];
};

export default async function SharedTripPage({
  params,
}: PageProps<"/s/[token]">) {
  const { token } = await params;
  if (!UUID_RE.test(token)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_trip_by_token", {
    p_token: token,
  });

  if (error || !data) notFound();
  const payload = data as SharedTripPayload | null;
  if (!payload?.trip) notFound();

  // Public trips have a canonical URL at /samples/[id]. Token URLs still
  // resolve for backwards compatibility (so an unlisted link doesn't die
  // when the owner promotes the trip), but the canonical destination wins.
  if (payload.trip.visibility === "public") {
    redirect(`/samples/${payload.trip.id}`);
  }

  return <TripView trip={payload.trip} days={payload.days ?? []} />;
}

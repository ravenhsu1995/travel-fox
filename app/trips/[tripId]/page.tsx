import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
import type { Day, Trip } from "@/lib/types";

export default async function TripDetailPage({
  params,
}: PageProps<"/trips/[tripId]">) {
  const { tripId } = await params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect(`/login?redirect=/trips/${tripId}`);

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle<Trip>();

  if (!trip) notFound();

  const isOwner = trip.owner_id === claims.claims.sub;

  const { data: days } = await supabase
    .from("days")
    .select("*")
    .eq("trip_id", tripId)
    .order("sort_order");

  return (
    <>
      <TripView
        trip={trip}
        days={(days ?? []) as Day[]}
        canEdit={isOwner}
        showExpenseLink={isOwner}
      />
      {isOwner && (
        <div className="mx-auto w-full max-w-[480px] px-4 pb-10">
          <Link
            href={`/trips/${tripId}/edit`}
            className="block w-full rounded-full bg-navy py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-navy-lt"
          >
            ✏️ 編輯整個行程
          </Link>
        </div>
      )}
    </>
  );
}

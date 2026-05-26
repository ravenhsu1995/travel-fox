import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect(`/login?redirect=/trips/${tripId}/edit`);

  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, created_at")
    .eq("id", tripId)
    .maybeSingle<Trip>();
  if (!trip) notFound();
  if (trip.owner_id !== claims.claims.sub) {
    return (
      <main className="mx-auto w-full max-w-[480px] px-4 pt-10">
        <p className="text-sm text-muted">這個行程不屬於你，無法編輯。</p>
        <Link
          href={`/trips/${tripId}`}
          className="mt-3 inline-block text-sm font-semibold text-gold hover:underline"
        >
          ← 回到檢視
        </Link>
      </main>
    );
  }

  const { data: days } = await supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order");

  return (
    <TripEditor
      initialTrip={trip}
      initialDays={(days ?? []) as Day[]}
      initialDayId={initialDayId}
    />
  );
}

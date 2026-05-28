import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserClaims } from "@/lib/auth";
import TripView from "@/components/trip/TripView";
import ShareButton from "@/components/trip/ShareButton";
import type { Day, Trip } from "@/lib/types";

export default async function TripDetailPage({
  params,
}: PageProps<"/trips/[tripId]">) {
  const { tripId } = await params;
  const supabase = await createClient();
  const claims = await getUserClaims();
  if (!claims) redirect(`/login?redirect=/trips/${tripId}`);

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

  // Owner guard: /trips/[id] is the owner-side route. Non-owner reaching
  // a public trip's owner URL is redirected to the gallery view; anything
  // else is 404.
  if (trip.owner_id !== claims.sub) {
    if (trip.visibility === "public" || trip.is_public_sample) {
      redirect(`/samples/${trip.id}`);
    }
    notFound();
  }

  const { data: days } = await daysPromise;

  return (
    <>
      {/* 返回管理頁的導覽列 */}
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 pt-3">
        <Link
          href="/trips"
          className="inline-flex h-8 items-center text-sm font-semibold text-muted hover:text-ink"
        >
          ← 我的行程
        </Link>
        {trip.visibility !== "private" && <ShareButton trip={trip} />}
      </div>

      {/* 純查閱：不傳 canEdit / showExpenseLink，預設 false */}
      <TripView trip={trip} days={(days ?? []) as Day[]} />
    </>
  );
}

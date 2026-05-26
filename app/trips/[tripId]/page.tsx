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
    .select("id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, created_at")
    .eq("id", tripId)
    .maybeSingle<Trip>();

  if (!trip) notFound();

  const { data: days } = await supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order");

  return (
    <>
      {/* 返回管理頁的導覽列 */}
      <div className="mx-auto w-full max-w-[480px] px-4 pt-3">
        <Link
          href="/trips"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← 我的行程
        </Link>
      </div>

      {/* 純查閱：不傳 canEdit / showExpenseLink，預設 false */}
      <TripView
        trip={trip}
        days={(days ?? []) as Day[]}
      />
    </>
  );
}

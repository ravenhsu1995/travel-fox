import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
import { stripFeedbackFromDays } from "@/lib/strip-feedback";
import type { Day, TripForView } from "@/lib/types";

export const revalidate = 60;

export default async function SampleTripPage({
  params,
}: PageProps<"/samples/[tripId]">) {
  const { tripId } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select(
      "id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, public_display_name, share_show_feedback, created_at",
    )
    .eq("id", tripId)
    .maybeSingle<TripForView>();

  if (!trip) notFound();
  if (trip.visibility !== "public" && !trip.is_public_sample) notFound();

  const { data: days } = await supabase
    .from("days")
    .select("id, trip_id, date, day_label, theme, hotel, timeline, sort_order")
    .eq("trip_id", tripId)
    .order("sort_order");

  const ownerName = trip.public_display_name?.trim() || "匿名狐狸";
  const rawDays = (days ?? []) as Day[];
  const visibleDays = trip.share_show_feedback
    ? rawDays
    : stripFeedbackFromDays(rawDays);

  return (
    <>
      <div className="mx-auto w-full max-w-[480px] px-4 pt-3">
        <Link
          href="/samples"
          className="inline-flex h-8 items-center text-sm font-semibold text-muted hover:text-ink"
        >
          ← 範例行程
        </Link>
      </div>
      <TripView trip={trip} days={visibleDays} />
      <section className="mx-auto w-full max-w-[480px] px-4 pb-10">
        <div className="rounded-xl bg-gold-pale p-4 text-center">
          <p className="text-xs text-muted">
            這個行程由 <span className="font-semibold text-ink">{ownerName}</span> 公開分享
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-full bg-navy px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-navy-lt"
          >
            登入 / 註冊建立自己的行程 →
          </Link>
        </div>
      </section>
    </>
  );
}

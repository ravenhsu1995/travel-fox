import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
import { stripFeedbackFromDays } from "@/lib/strip-feedback";
import type { Day, TripForView, Visibility } from "@/lib/types";

// RFC 4122 UUID format (any version). Guards against malformed input
// hitting the PostgREST `uuid` cast (which throws a 400 instead of nullable).
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SharedPayload = {
  visibility: Visibility;
  trip_id: string;
  trip: TripForView | null;
  days: Day[] | null;
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
  const payload = data as SharedPayload | null;
  if (!payload) notFound();

  // Public trips have a canonical URL at /samples/[id]. Token URLs still
  // resolve (so an unlisted link doesn't die when the owner promotes the
  // trip), but the canonical destination wins.
  if (payload.visibility === "public") {
    redirect(`/samples/${payload.trip_id}`);
  }

  // Private but the share_token still resolves — the owner switched the
  // trip back to private. Show a calm landing page so the link doesn't
  // look broken; if the owner re-opens later, the same URL springs back.
  if (payload.visibility === "private") {
    return <PrivateLanding />;
  }

  // Unlisted: render the itinerary read-only.
  if (!payload.trip) notFound();
  const rawDays = payload.days ?? [];
  const visibleDays = payload.trip.share_show_feedback
    ? rawDays
    : stripFeedbackFromDays(rawDays);
  return <TripView trip={payload.trip} days={visibleDays} />;
}

function PrivateLanding() {
  return (
    <main
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5"
      style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}
    >
      <section className="my-auto flex flex-col items-center rounded-3xl bg-gradient-to-b from-navy to-navy-lt px-6 py-12 text-center text-white shadow-xl">
        <div
          aria-hidden
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-5xl backdrop-blur-sm"
        >
          🔒
        </div>

        <h1
          className="mt-6 text-2xl font-black tracking-wide"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          此行程目前為私人
        </h1>

        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-white/75">
          擁有者目前不公開這份行程。
        </p>

        <div className="mt-8 flex w-full flex-col gap-2">
          <Link
            href="/samples"
            className="flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-navy shadow-sm hover:bg-white/90"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            看其他公開行程
          </Link>
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-full border border-white/30 px-5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            回首頁
          </Link>
        </div>
      </section>

      <div className="h-8" aria-hidden />
    </main>
  );
}

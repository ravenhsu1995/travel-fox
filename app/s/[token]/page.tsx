import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
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
  return <TripView trip={payload.trip} days={payload.days ?? []} />;
}

function PrivateLanding() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-5xl">🔒</div>
      <h1 className="mt-4 text-lg font-extrabold text-navy">
        此行程目前為私人
      </h1>
      <p className="mt-2 text-sm text-muted">
        擁有者把這個行程切回了私人，所以暫時看不到內容。
        <br />
        如果之後再次開放，這條連結會自動恢復。
      </p>
      <Link
        href="/samples"
        className="mt-6 inline-flex h-10 items-center rounded-full bg-navy px-5 text-xs font-semibold text-white shadow-sm hover:bg-navy-lt"
      >
        看其他公開行程 →
      </Link>
    </main>
  );
}

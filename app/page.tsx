import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TripView from "@/components/trip/TripView";
import type { Day, Trip } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("*")
    .eq("is_public_sample", true)
    .maybeSingle<Trip>();

  if (tripErr || !trip) {
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-12">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-navy">🦊 旅行狐狸</h1>
          <p className="mt-1 text-sm text-muted">
            建立並管理你的多日旅遊行程與記帳
          </p>
        </header>
        <section className="rounded-xl border border-dashed border-line-2 bg-card p-5">
          <p className="text-sm text-ink-2">
            尚未連上 Supabase，或公開範例 trip 還沒灌入。請依 [supabase/README.md](/) 完成設定後重整本頁。
          </p>
        </section>
      </main>
    );
  }

  const { data: days } = await supabase
    .from("days")
    .select("*")
    .eq("trip_id", trip.id)
    .order("sort_order");

  return (
    <>
      <TripView trip={trip} days={(days ?? []) as Day[]} />
      <section className="mx-auto w-full max-w-[480px] px-4 pb-10">
        <div className="rounded-xl bg-gold-pale p-4 text-center">
          <p className="text-sm font-semibold text-ink">
            這是公開的旅遊行程範例
          </p>
          <p className="mt-1 text-xs text-muted">
            登入後可以建立、編輯你自己的多個行程
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-full bg-navy px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-navy-lt"
          >
            登入 / 註冊 →
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteTripButton from "@/components/trip/DeleteTripButton";
import type { Trip } from "@/lib/types";

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/login?redirect=/trips");

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("owner_id", claims.claims.sub)
    .order("created_at", { ascending: false });

  const list = (trips ?? []) as Trip[];

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pt-5 pb-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy">我的行程</h1>
        <Link
          href="/trips/new"
          className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gold-lt"
        >
          + 新增行程
        </Link>
      </div>

      {list.length === 0 ? (
        <section className="rounded-xl border border-dashed border-line-2 bg-card p-8 text-center">
          <div className="mb-2 text-3xl">🗺️</div>
          <h2 className="text-base font-bold text-ink">還沒有行程</h2>
          <p className="mt-1 text-sm text-muted">建立你的第一個旅遊行程</p>
          <Link
            href="/trips/new"
            className="mt-4 inline-block rounded-full bg-navy px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-navy-lt"
          >
            開始 →
          </Link>
        </section>
      ) : (
        <ul className="space-y-3">
          {list.map((t) => (
            <li key={t.id} className="rounded-xl bg-card shadow-sm">
              {/* 查閱區：點擊進入前台 view */}
              <Link
                href={`/trips/${t.id}`}
                className="flex items-center gap-3 px-4 pt-4 pb-3 transition hover:opacity-80"
              >
                <div className="text-2xl">{t.cover_emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">
                    {t.title}
                  </div>
                  {t.subtitle && (
                    <div className="truncate text-xs text-muted">
                      {t.subtitle}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted">
                    <span>
                      {t.start_date} – {t.end_date}
                    </span>
                    <span>· {daysBetween(t.start_date, t.end_date)} 天</span>
                  </div>
                </div>
                <span className="text-muted">›</span>
              </Link>

              {/* 管理操作列 */}
              <div className="flex items-center gap-1 border-t border-line-2 px-3 py-2">
                <Link
                  href={`/trips/${t.id}/edit`}
                  className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-ink-2 hover:bg-card-pure"
                >
                  ✏️ 編輯
                </Link>
                <Link
                  href={`/trips/${t.id}/expenses`}
                  className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-ink-2 hover:bg-card-pure"
                >
                  💴 記帳
                </Link>
                <div className="ml-auto">
                  <DeleteTripButton tripId={t.id} tripTitle={t.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

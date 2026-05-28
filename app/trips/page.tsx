import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserClaims } from "@/lib/auth";
import DeleteTripButton from "@/components/trip/DeleteTripButton";
import VisibilityBadgeButton from "@/components/trip/VisibilityBadgeButton";
import ShareButton from "@/components/trip/ShareButton";
import EditModeMenu from "@/components/trip/EditModeMenu";
import { EyeIcon, WalletIcon } from "@/components/icons";
import type { Trip } from "@/lib/types";

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export default async function TripsPage() {
  const supabase = await createClient();
  const claims = await getUserClaims();
  if (!claims) redirect("/login?redirect=/trips");

  const { data: trips } = await supabase
    .from("trips")
    .select("id, owner_id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, share_token, public_display_name, share_show_feedback, created_at")
    .eq("owner_id", claims.sub)
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
          <Image
            src="/mascot-empty.webp"
            alt=""
            width={96}
            height={116}
            priority
            unoptimized
            className="mx-auto mb-3 h-[96px] w-auto object-contain"
          />
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
            <li key={t.id} className="relative rounded-xl bg-card shadow-sm">
              {/* Visibility badge — its own click target. Sits absolute over
                  the top-right; the info Link below uses `mr-12` to step its
                  hit-area back so tapping the badge can't graze the link. */}
              <VisibilityBadgeButton
                trip={t}
                className="absolute right-2 top-2 z-10"
              />

              {/* Info area — clickable into /trips/[id], hit-area stops short
                  of the badge. */}
              <Link
                href={`/trips/${t.id}`}
                className="flex items-center gap-3 rounded-t-xl px-4 pt-4 pb-3 mr-12 transition hover:bg-card-pure"
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
              </Link>

              {/* Action bar: 檢閱 / 編輯 / 記帳 / 分享(條件) / 刪除
                  All icons are inline SVGs in a unified Lucide stroke style
                  so the row reads as one consistent toolbar. */}
              <div className="flex items-center gap-1 border-t border-line-2 px-3 py-2">
                <Link
                  href={`/trips/${t.id}`}
                  className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-ink-2 hover:bg-card-pure"
                >
                  <EyeIcon />
                  檢閱
                </Link>
                <EditModeMenu tripId={t.id} />
                <Link
                  href={`/trips/${t.id}/expenses`}
                  className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-ink-2 hover:bg-card-pure"
                >
                  <WalletIcon />
                  記帳
                </Link>
                {t.visibility !== "private" && <ShareButton trip={t} />}
                {!t.is_public_sample && (
                  <div className="ml-auto">
                    <DeleteTripButton tripId={t.id} tripTitle={t.title} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

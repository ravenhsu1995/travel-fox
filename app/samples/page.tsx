import Link from "next/link";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import type { TripForView } from "@/lib/types";

export const revalidate = 60;

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function displayName(t: Pick<TripForView, "public_display_name">): string {
  return t.public_display_name?.trim() || "匿名狐狸";
}

export default async function SamplesPage() {
  const supabase = createPublicClient();
  const { data: trips } = await supabase
    .from("trips")
    .select(
      "id, title, subtitle, start_date, end_date, cover_emoji, is_public_sample, visibility, public_display_name, created_at",
    )
    .or("visibility.eq.public,is_public_sample.eq.true")
    .order("is_public_sample", { ascending: false })
    .order("created_at", { ascending: false });

  const list = (trips ?? []) as Omit<TripForView, "owner_id" | "share_token">[];

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pt-5 pb-10">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy">範例行程</h1>
        <Link
          href="/"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← 首頁
        </Link>
      </div>
      <p className="mb-5 text-[11px] text-muted">
        其他用戶選擇公開分享的行程
      </p>

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
          <p className="text-sm text-muted">目前還沒有公開的範例行程</p>
        </section>
      ) : (
        <ul className="space-y-3">
          {list.map((t) => (
            <li key={t.id} className="rounded-xl bg-card shadow-sm">
              <Link
                href={`/samples/${t.id}`}
                className="flex items-center gap-3 px-4 py-4 transition hover:opacity-80"
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
                  <div className="mt-0.5 text-[11px] text-ink-2">
                    by {displayName(t)}
                  </div>
                </div>
                <span className="text-muted">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

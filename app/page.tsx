import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { Trip } from "@/lib/types";

export const revalidate = 60;

function formatDate(iso: string) {
  return iso.replaceAll("-", "/");
}

export default async function Home() {
  const supabase = createPublicClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("title, subtitle, start_date, end_date, cover_emoji")
    .eq("is_public_sample", true)
    .maybeSingle<
      Pick<
        Trip,
        "title" | "subtitle" | "start_date" | "end_date" | "cover_emoji"
      >
    >();

  return (
    <main
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col overflow-x-hidden"
      style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
    >
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden px-5 pt-4"
        style={{ minHeight: "360px" }}
      >
        {/* Hero illustration — large, fox glued to the bottom edge of this section */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-0"
          style={{ width: "88%", height: "92%" }}
        >
          <Image
            src="/hero-fox-kansai.png"
            alt="旅行狐狸 — 眺望關西海岸與城市風景"
            fill
            preload
            sizes="(max-width: 480px) 88vw, 420px"
            className="object-cover object-bottom"
          />
        </div>

        {/* Pin-trail decoration (top-left, ~half viewport, just above the headline) */}
        <div
          className="pointer-events-none absolute left-4 top-14 z-10"
          style={{ width: "50%", aspectRatio: "1935 / 374" }}
        >
          <Image
            src="/pin-trail.png"
            alt=""
            fill
            sizes="(max-width: 480px) 50vw, 240px"
            className="object-contain object-left"
            aria-hidden
          />
        </div>

        {/* Headline — sits on top of the illustration, max width keeps it on the left */}
        <h1
          className="relative z-10 max-w-[58%] pt-20 text-[30px] font-black leading-[1.55] text-brand"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "0.12em" }}
        >
          讓<span className="text-orange">狐狸</span>
          <br />
          陪你簡單旅行
        </h1>

        {/* Spacer so sub-copy sits below the illustration's natural bottom */}
        <div className="h-12" aria-hidden />

        {/* Leaves decoration (overlap with illustration's bottom-left grass area) */}
        <svg
          className="pointer-events-none absolute -left-1 bottom-12 z-[1] h-16 w-20 text-orange/40"
          viewBox="0 0 100 80"
          fill="none"
          aria-hidden
        >
          <path
            d="M20 70 C 18 50, 26 30, 40 18 M40 18 C 38 28, 30 36, 22 38 M40 18 C 50 22, 56 32, 58 44"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <ellipse cx="32" cy="28" rx="6" ry="3" fill="currentColor" transform="rotate(-30 32 28)" />
          <ellipse cx="48" cy="34" rx="6" ry="3" fill="currentColor" transform="rotate(40 48 34)" />
          <ellipse cx="24" cy="56" rx="5" ry="2.5" fill="currentColor" transform="rotate(-15 24 56)" />
        </svg>

        {/* Sub-copy below the hero columns */}
        <p className="relative z-10 -mt-12 text-[11px] leading-[2] text-muted">
          規劃行程、收藏景點、記錄足跡 ——
          <br />
          一切只為陪伴你專注於旅途中的美好。
        </p>
      </section>

      {/* ═══ FEATURED TRIP CARD ═══ */}
      {trip && (
        <section className="mt-2 px-5">
          <Link
            href="/sample"
            className="group block rounded-2xl bg-card-pure p-4 shadow-lg ring-1 ring-line/70 transition active:scale-[0.99]"
          >
            <div className="grid grid-cols-[68px_minmax(0,1fr)_56px] items-center gap-2 min-[380px]:grid-cols-[78px_minmax(0,1fr)_72px] min-[380px]:gap-3 sm:grid-cols-[92px_minmax(0,1fr)_112px] sm:gap-4">
              <div className="relative h-[104px] w-[68px] overflow-hidden rounded-xl ring-1 ring-line min-[380px]:h-[108px] min-[380px]:w-[78px] sm:h-[118px] sm:w-[92px]">
                <Image
                  src="/thumb-kansai-portrait.jpg"
                  alt="2026 關西行 — 倉敷美觀地區"
                  width={312}
                  height={472}
                  preload
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex h-[104px] min-w-0 translate-x-1.5 flex-col justify-between min-[380px]:h-[108px] min-[380px]:translate-x-2 sm:h-[118px]">
                <div className="inline-flex w-fit items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
                  <svg width="12" height="12" className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M8 3v15M16 6v15M3 6l5-3 8 3 5-3v15l-5 3-8-3-5 3V6z" />
                  </svg>
                  範例行程
                </div>
                <h2 className="whitespace-nowrap text-[16px] font-extrabold leading-tight text-navy min-[380px]:text-[17px]">
                  {trip.title}
                </h2>
                <div className="flex items-center gap-1.5 text-[8px] text-muted min-[380px]:text-[11px]">
                  <svg width="12" height="12" className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" />
                  </svg>
                  <span className="whitespace-nowrap">
                    {formatDate(trip.start_date)}-{formatDate(trip.end_date)}
                  </span>
                </div>
                {trip.subtitle && (
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-2">
                    <svg width="12" height="12" className="shrink-0 text-orange" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                    </svg>
                    <span className="whitespace-nowrap">{trip.subtitle}</span>
                  </div>
                )}
              </div>

              <div className="relative h-14 w-14 shrink-0 min-[380px]:h-[72px] min-[380px]:w-[72px] sm:h-28 sm:w-28">
                <Image
                  src="/route-map.png"
                  alt=""
                  fill
                  sizes="112px"
                  className="translate-x-2 scale-[1.3] object-contain min-[380px]:translate-x-3 min-[380px]:scale-[1.36] sm:translate-x-4 sm:scale-[1.18]"
                  aria-hidden
                />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ═══ CTAS ═══ */}
      <section className="mt-5 flex flex-col gap-3 px-5">
        <Link
          href="/samples"
          className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-full border-2 border-teal/40 bg-card-pure px-5 text-[16px] font-bold tracking-wide text-teal shadow-sm transition active:scale-[0.98]"
        >
          <svg width="18" height="18" className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 3v15M16 6v15M3 6l5-3 8 3 5-3v15l-5 3-8-3-5 3V6z" />
          </svg>
          大家的精彩旅程
        </Link>

        <Link
          href="/trips"
          className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-full bg-orange px-5 text-[16px] font-bold tracking-wide text-white shadow-md transition hover:bg-orange-lt active:scale-[0.98]"
        >
          <svg width="18" height="18" className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 7L7 4L10 7L14 7L17 4L20 7Q17 15 12 18Q7 15 4 7Z" />
            <path d="M9 11L9.01 11" />
            <path d="M15 11L15.01 11" />
            <path d="M12 14L12.01 14" />
          </svg>
          規劃我的旅程
        </Link>
      </section>
    </main>
  );
}

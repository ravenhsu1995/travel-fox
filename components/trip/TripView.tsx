"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Day, TripForView } from "@/lib/types";
import HotelCard from "./HotelCard";
import TimelineItemView from "./TimelineItemView";
import { resolveDayHotel } from "@/lib/resolveDayHotel";
import { mascotIndexForDay } from "@/lib/mascot-for-day";
import { normalizeDays } from "@/lib/timeline-compat";
import { PencilIcon, WalletIcon } from "@/components/icons";

type Props = {
  trip: TripForView;
  days: Day[];
  canEdit?: boolean;
  showExpenseLink?: boolean;
};

export default function TripView({
  trip,
  days,
  canEdit = false,
  showExpenseLink = false,
}: Props) {
  const sorted = useMemo(
    () => normalizeDays(days).sort((a, b) => a.sort_order - b.sort_order),
    [days],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];
  const resolvedHotel = active ? resolveDayHotel(sorted, active.id) : null;
  const mascotIndex = mascotIndexForDay(trip.id, activeIdx);

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      <div className="bg-gradient-to-b from-navy to-navy-lt px-4 pt-4 pb-2 text-white">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-wide">
              {trip.cover_emoji} {trip.title}
            </h1>
            <p className="mt-0.5 truncate text-[11px] opacity-70">
              {trip.start_date} – {trip.end_date}
              {trip.subtitle && ` · ${trip.subtitle}`}
            </p>
          </div>
          {showExpenseLink && (
            <Link
              href={`/trips/${trip.id}/expenses`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm"
            >
              <WalletIcon className="h-3.5 w-3.5" />
              記帳
            </Link>
          )}
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-2">
          {sorted.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                i === activeIdx
                  ? "border-gold bg-gold text-white shadow-sm"
                  : "border-white/15 bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {d.day_label ?? `Day ${i + 1}`}
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="space-y-4 px-4 py-5">
          <section className="relative overflow-hidden rounded-xl bg-card p-4 shadow-sm">
            {active.theme && (
              <Image
                key={mascotIndex}
                src={`/mascot-trip-${mascotIndex}.webp`}
                alt=""
                width={256}
                height={256}
                sizes="80px"
                priority
                aria-hidden
                className="pointer-events-none absolute right-6 top-1/2 h-[48px] w-auto -translate-y-1/2 select-none"
              />
            )}
            <div className="relative flex items-center justify-between pr-20">
              <div className="text-xs font-semibold text-muted">
                {active.day_label}
              </div>
              {canEdit && (
                <Link
                  href={`/trips/${trip.id}/edit?day=${active.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  編輯
                </Link>
              )}
            </div>
            {active.theme && (
              <div className="relative mt-1.5 text-sm font-semibold text-ink pr-20">
                {active.theme}
              </div>
            )}
          </section>

          {resolvedHotel && resolvedHotel.hotel && (
            <HotelCard resolved={resolvedHotel} />
          )}

          {active.timeline.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-2 bg-card p-6 text-center text-sm text-muted">
              這一天還沒有時間安排
              {canEdit && (
                <div className="mt-2">
                  <Link
                    href={`/trips/${trip.id}/edit?day=${active.id}`}
                    className="font-semibold text-gold hover:underline"
                  >
                    開始編輯 →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <section className="rounded-xl bg-card p-4 pt-5 shadow-sm">
              <div className="space-y-5">
                {active.timeline.map((item, i) => (
                  <TimelineItemView key={i} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

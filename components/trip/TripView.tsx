"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Day, Trip } from "@/lib/types";
import HotelCard from "./HotelCard";
import TimelineItemView from "./TimelineItemView";
import { resolveDayHotel } from "@/lib/resolveDayHotel";

type Props = {
  trip: Trip;
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
    () => [...days].sort((a, b) => a.sort_order - b.sort_order),
    [days],
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];
  const resolvedHotel = active ? resolveDayHotel(sorted, active.id) : null;

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      <div className="bg-gradient-to-b from-navy to-navy-lt px-4 pt-4 pb-2 text-white">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold tracking-wide">
              {trip.cover_emoji} {trip.title}
            </h1>
            <p className="text-[11px] opacity-70">
              {trip.start_date} – {trip.end_date}
              {trip.subtitle && ` · ${trip.subtitle}`}
            </p>
          </div>
          {showExpenseLink && (
            <Link
              href={`/trips/${trip.id}/expenses`}
              className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm"
            >
              💴 記帳
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
          <section className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-muted">
                {active.day_label}
              </div>
              {canEdit && (
                <Link
                  href={`/trips/${trip.id}/edit?day=${active.id}`}
                  className="text-xs font-semibold text-gold hover:underline"
                >
                  ✏️ 編輯
                </Link>
              )}
            </div>
            {active.theme && (
              <div className="mt-1.5 text-sm font-semibold text-ink">
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

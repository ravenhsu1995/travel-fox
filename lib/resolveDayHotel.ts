import type { Day, HotelInfo } from "./types";

export type HotelPhase = "single" | "checkin" | "middle" | "checkout" | "none";

export type ResolvedHotel = {
  hotel: HotelInfo | null;
  phase: HotelPhase;
  nightIndex: number;
  totalNights: number;
  sourceDayId: string | null;
};

const EMPTY: ResolvedHotel = {
  hotel: null,
  phase: "none",
  nightIndex: 0,
  totalNights: 0,
  sourceDayId: null,
};

export function resolveDayHotel(days: Day[], targetId: string): ResolvedHotel {
  const sorted = [...days].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((d) => d.id === targetId);
  if (idx < 0) return EMPTY;

  for (let i = idx; i >= 0; i--) {
    const h = sorted[i].hotel;
    if (!h) continue;
    const n = Math.max(1, h.nights ?? 1);
    if (idx < i + n) {
      const nightIndex = idx - i + 1;
      const phase: HotelPhase =
        n === 1
          ? "single"
          : nightIndex === 1
            ? "checkin"
            : nightIndex === n
              ? "checkout"
              : "middle";
      return {
        hotel: h,
        phase,
        nightIndex,
        totalNights: n,
        sourceDayId: sorted[i].id,
      };
    }
    break;
  }
  return EMPTY;
}

export function daysRemainingFrom(days: Day[], dayId: string): number {
  const sorted = [...days].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((d) => d.id === dayId);
  return idx < 0 ? 1 : sorted.length - idx;
}

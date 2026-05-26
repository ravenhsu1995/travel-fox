import { googleMapUrl } from "@/lib/maps";
import type { ResolvedHotel } from "@/lib/resolveDayHotel";

export default function HotelCard({ resolved }: { resolved: ResolvedHotel }) {
  const { hotel, phase } = resolved;
  if (!hotel || phase === "none") return null;

  const showCheckin =
    (phase === "single" || phase === "checkin") && !!hotel.checkin;
  const showCheckout =
    (phase === "single" || phase === "checkout") && !!hotel.checkout;
  const showCost = phase !== "checkout" && !!hotel.cost;

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
      </div>
      <div className="text-sm font-semibold text-ink">{hotel.name}</div>
      {(showCheckin || showCheckout) && (
        <div className="mt-1 space-y-0.5 text-xs text-muted">
          {showCheckin && (
            <span className="block">Check-in：{hotel.checkin} 點後</span>
          )}
          {showCheckout && (
            <span className="block">明早 check-out 提醒：{hotel.checkout} 點前</span>
          )}
        </div>
      )}
      {showCost && (
        <div className="mt-1 text-xs text-ink-2">{hotel.cost}</div>
      )}
      {(hotel.mapQ || hotel.name) && (
        <a
          href={googleMapUrl(hotel.mapQ || hotel.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-info hover:underline"
        >
          在 Google 地圖開啟 →
        </a>
      )}
    </section>
  );
}

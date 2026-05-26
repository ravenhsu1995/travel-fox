import { googleMapUrl } from "@/lib/maps";
import type { ResolvedHotel } from "@/lib/resolveDayHotel";
import CostBadge from "./CostBadge";
import MapButton from "./MapButton";

export default function HotelCard({ resolved }: { resolved: ResolvedHotel }) {
  const { hotel, phase } = resolved;
  if (!hotel || phase === "none") return null;

  const showCheckin =
    (phase === "single" || phase === "checkin") && !!hotel.checkin;
  const showCheckout =
    (phase === "single" || phase === "checkout") && !!hotel.checkout;
  const showCost =
    phase !== "checkout" &&
    (typeof hotel.costAmount === "number" || !!hotel.cost);
  const mapHref = googleMapUrl(hotel.mapQ || hotel.name);

  return (
    <section className="relative rounded-xl bg-card p-4 pr-14 shadow-sm">
      {(hotel.mapQ || hotel.name) && <MapButton href={mapHref} />}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
      </div>
      <div className="text-sm font-semibold text-ink">{hotel.name}</div>
      {(showCheckin || showCheckout) && (
        <div className="mt-1 space-y-0.5 text-xs text-muted">
          {showCheckin && (
            <span className="block">Check-in：{hotel.checkin} 後</span>
          )}
          {showCheckout && (
            <span className="block">明早 check-out 提醒：{hotel.checkout} 前</span>
          )}
        </div>
      )}
      {showCost && (
        <CostBadge
          value={hotel.cost}
          amount={hotel.costAmount}
          currency={hotel.costCurrency}
        />
      )}
    </section>
  );
}

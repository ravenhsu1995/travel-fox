import type { HotelInfo } from "@/lib/types";
import { googleMapUrl } from "@/lib/maps";

export default function HotelCard({ hotel }: { hotel: HotelInfo }) {
  return (
    <section className="rounded-xl bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
      </div>
      <div className="text-sm font-semibold text-ink">{hotel.name}</div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        {hotel.checkin && <span>{hotel.checkin}～</span>}
        {hotel.checkout && <span>明早～{hotel.checkout}</span>}
      </div>
      {hotel.cost && (
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

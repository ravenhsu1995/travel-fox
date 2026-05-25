import type { TimelineItem } from "@/lib/types";
import { googleMapUrl } from "@/lib/maps";

function transportEmoji(tool: string): string {
  if (tool === "飛機") return "✈️";
  if (tool === "高速船") return "🚢";
  if (tool === "自駕") return "🚗";
  if (tool === "巴士" || tool === "利木津巴士") return "🚌";
  // 特急、JR 及其他鐵道
  return "🚆";
}

export default function TimelineItemView({ item }: { item: TimelineItem }) {
  return (
    <article className="relative pl-12">
      <div className="absolute left-3 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-sm">
        {item.time}
      </div>
      <div className="absolute left-[26px] top-9 bottom-0 w-px bg-line-2" />

      <div className="mb-1">
        <h4 className="text-sm font-bold text-navy">{item.label}</h4>
      </div>

      {item.transport && item.transport.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.transport.map((t, i) => (
            <div
              key={i}
              className="rounded-md border border-success/40 bg-success/5 p-2.5 text-xs"
            >
              <div className="mb-0.5 flex items-center gap-2">
                <span className="font-bold text-ink">{transportEmoji(t.tool)} {t.tool}</span>
                {t.duration && (
                  <span className="ml-auto text-muted">{t.duration}</span>
                )}
              </div>
              <div className="text-muted">
                {t.from} → {t.to}
              </div>
              {t.cost && <div className="mt-0.5 text-ink-2">{t.cost}</div>}
              {t.note && (
                <div className="mt-1 text-[11px] text-muted">{t.note}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {item.exps && item.exps.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.exps.map((e, i) => (
            <div
              key={i}
              className="rounded-md border border-line bg-card-pure p-2.5 text-xs"
            >
              {e.headline && (
                <div className="text-[11px] font-semibold text-gold">
                  ✨ {e.headline}
                </div>
              )}
              <div className="mt-0.5 font-bold text-ink">{e.spot}</div>
              {e.desc && (
                <div className="mt-0.5 text-muted">{e.desc}</div>
              )}
              {e.cost && (
                <div className="mt-1 text-[11px] text-ink-2">{e.cost}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {item.meals && item.meals.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.meals.map((meal, i) => (
            <div key={i} className="rounded-md bg-gold-pale p-2.5 text-xs">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold text-gold">🍽 {meal.type}</span>
                <a
                  href={googleMapUrl(meal.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-info hover:underline"
                >
                  地圖 ↗
                </a>
              </div>
              <div className="font-bold text-ink">{meal.name}</div>
              {meal.dishes && (
                <div className="mt-0.5 text-muted">{meal.dishes}</div>
              )}
              {meal.cost && (
                <div className="mt-0.5 text-ink-2">{meal.cost}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

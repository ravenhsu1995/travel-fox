import type { TimelineItem } from "@/lib/types";
import { googleMapUrl } from "@/lib/maps";
import CostBadge from "./CostBadge";
import MapButton from "./MapButton";

function transportEmoji(tool: string): string {
  if (tool === "飛機") return "✈️";
  if (tool === "高速船") return "🚢";
  if (tool === "自駕") return "🚗";
  if (tool === "巴士" || tool === "利木津巴士") return "🚌";
  return "🚆";
}

const TYPE_BADGE: Record<TimelineItem["type"], { label: string; cls: string }> = {
  transport: { label: "交通", cls: "text-success" },
  meal: { label: "餐飲", cls: "text-gold" },
  exp: { label: "體驗", cls: "text-info" },
};

export default function TimelineItemView({ item }: { item: TimelineItem }) {
  const badge = TYPE_BADGE[item.type];
  return (
    <article className="relative pl-14">
      <div className="absolute left-0 top-1 flex h-8 min-w-12 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
        {item.time}
      </div>
      <div className="absolute left-6 top-10 bottom-0 w-px bg-line-2" />

      <div className={`mb-1 text-[10px] font-bold ${badge.cls}`}>
        {badge.label}
      </div>

      {item.type === "transport" && item.transport && (
        <div className="rounded-md border border-success/40 bg-success/5 p-2.5 text-xs">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="font-bold text-ink">
              {transportEmoji(item.transport.tool)} {item.transport.tool}
            </span>
            {item.transport.duration && (
              <span className="ml-auto text-muted">{item.transport.duration}</span>
            )}
          </div>
          <div className="text-muted">
            {item.transport.from} → {item.transport.to}
          </div>
          <CostBadge
            value={item.transport.cost}
            amount={item.transport.costAmount}
            currency={item.transport.costCurrency}
          />
          {item.transport.note && (
            <div className="mt-1 text-[11px] text-muted">{item.transport.note}</div>
          )}
        </div>
      )}

      {item.type === "meal" && item.meal && (
        <div className="relative rounded-md bg-gold-pale p-2.5 pr-12 text-xs">
          <MapButton href={googleMapUrl(item.meal.name)} />
          <div className="mb-1 flex items-center justify-between">
            <span className="font-bold text-gold">🍽 {item.meal.type}</span>
          </div>
          <div className="font-bold text-ink">{item.meal.name}</div>
          {item.meal.dishes && (
            <div className="mt-0.5 text-muted">{item.meal.dishes}</div>
          )}
          <CostBadge
            value={item.meal.cost}
            amount={item.meal.costAmount}
            currency={item.meal.costCurrency}
          />
        </div>
      )}

      {item.type === "exp" && item.exp && (
        <div className="rounded-md border border-line bg-card-pure p-2.5 text-xs">

          <div className="mt-0.5 font-bold text-ink">✨ {item.exp.spot}</div>
          {item.exp.desc && (
            <div className="mt-0.5 text-muted">{item.exp.desc}</div>
          )}
          <CostBadge
            value={item.exp.cost}
            amount={item.exp.costAmount}
            currency={item.exp.costCurrency}
          />
        </div>
      )}
    </article>
  );
}

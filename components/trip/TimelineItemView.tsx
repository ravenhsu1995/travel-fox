import Image from "next/image";
import type { Rating, TimelineItem } from "@/lib/types";
import { googleMapUrl } from "@/lib/maps";
import { normalizeTimelineItem } from "@/lib/timeline-compat";
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
  spot: { label: "景點", cls: "text-info" },
};

// Whitelist mapping — runtime data lives in days.timeline JSON and could
// contain dirty values from older rows; lookup miss falls through to no
// stamp render rather than emitting a broken <Image src=…>.
const RATING_STAMP_SRC: Record<Rating, string> = {
  "ㄅ": "/ratings/ㄅ.png",
  "ㄆ": "/ratings/ㄆ.png",
  "ㄇ": "/ratings/ㄇ.png",
  "ㄈ": "/ratings/ㄈ.png",
  "ㄉ": "/ratings/ㄉ.png",
};

type Props = {
  item: TimelineItem;
  showFeedbackDecorations?: boolean;
};

export default function TimelineItemView({
  item,
  showFeedbackDecorations = true,
}: Props) {
  const normalizedItem = normalizeTimelineItem(item);
  const badge = TYPE_BADGE[normalizedItem.type];
  const stampSrc = showFeedbackDecorations && normalizedItem.rating ? RATING_STAMP_SRC[normalizedItem.rating] : undefined;
  const commentText = showFeedbackDecorations ? normalizedItem.comment?.trim() : undefined;

  return (
    <article className="relative pl-14">
      <div className="absolute left-0 top-1 flex h-8 min-w-12 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
        {item.time}
      </div>
      <div className="absolute left-6 top-10 bottom-0 w-px bg-line-2" />

      <div className={`mb-1 text-[10px] font-bold ${badge.cls}`}>
        {badge.label}
      </div>

      <div className="relative">
        {normalizedItem.type === "transport" && normalizedItem.transport && (
          <div className="rounded-md border border-success/40 bg-success/5 p-2.5 text-xs">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="font-bold text-ink">
                {transportEmoji(normalizedItem.transport.tool)} {normalizedItem.transport.tool}
              </span>
              {normalizedItem.transport.duration && (
                <span className="ml-auto text-muted">{normalizedItem.transport.duration}</span>
              )}
            </div>
            <div className="text-muted">
              {normalizedItem.transport.from} → {normalizedItem.transport.to}
            </div>
            <CostBadge
              value={normalizedItem.transport.cost}
              amount={normalizedItem.transport.costAmount}
              currency={normalizedItem.transport.costCurrency}
            />
            {normalizedItem.transport.note && (
              <div className="mt-1 text-[11px] text-muted">{normalizedItem.transport.note}</div>
            )}
          </div>
        )}

        {normalizedItem.type === "meal" && normalizedItem.meal && (
          <div className="relative rounded-md bg-gold-pale p-2.5 pr-12 text-xs">
            <MapButton href={googleMapUrl(normalizedItem.meal.name)} />
            <div className="mb-1 flex items-center justify-between">
              <span className="font-bold text-gold">🍽 {normalizedItem.meal.type}</span>
            </div>
            <div className="font-bold text-ink">{normalizedItem.meal.name}</div>
            {normalizedItem.meal.dishes && (
              <div className="mt-0.5 text-muted">{normalizedItem.meal.dishes}</div>
            )}
            <CostBadge
              value={normalizedItem.meal.cost}
              amount={normalizedItem.meal.costAmount}
              currency={normalizedItem.meal.costCurrency}
            />
          </div>
        )}

        {normalizedItem.type === "spot" && normalizedItem.spot && (() => {
          const s = normalizedItem.spot;
          const isMinimal = !s.desc && !s.cost && s.costAmount == null;
          return (
            <div className="relative rounded-md border border-line bg-card-pure p-2.5 pr-12 text-xs">
              <MapButton href={googleMapUrl(s.name)} vCenter={isMinimal} />
              <div className="mt-0.5 font-bold text-ink">✨ {s.name}</div>
              {s.desc && <div className="mt-0.5 text-muted">{s.desc}</div>}
              <CostBadge
                value={s.cost}
                amount={s.costAmount}
                currency={s.costCurrency}
              />
            </div>
          );
        })()}

        {stampSrc && (
          <Image
            src={stampSrc}
            alt=""
            width={88}
            height={88}
            className="pointer-events-none absolute left-[60%] top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.18]"
            aria-hidden
          />
        )}
      </div>

      {commentText && (
        <div className="mt-1.5 rounded-md border border-line-2 bg-card-pure p-2 text-[11px] text-ink-2">
          「{commentText}」
        </div>
      )}
    </article>
  );
}

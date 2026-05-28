import Image from "next/image";
import type { Rating, TimelineItem } from "@/lib/types";
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
  const badge = TYPE_BADGE[item.type];
  const stampSrc = showFeedbackDecorations && item.rating ? RATING_STAMP_SRC[item.rating] : undefined;
  const commentText = showFeedbackDecorations ? item.comment?.trim() : undefined;

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

        {stampSrc && (
          <Image
            src={stampSrc}
            alt=""
            width={88}
            height={88}
            className="pointer-events-none absolute right-2 top-1/2 h-20 w-20 -translate-y-1/2 select-none opacity-[0.18]"
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

"use client";

import { useState } from "react";
import type { TimelineItem } from "@/lib/types";
import { googleMapUrl } from "@/lib/maps";
import MapView from "@/components/map/MapView";

export default function TimelineItemView({ item }: { item: TimelineItem }) {
  const [openMap, setOpenMap] = useState(false);
  const hasMap = !!item.coords;

  return (
    <article className="relative pl-12">
      <div className="absolute left-3 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-sm">
        {item.time}
      </div>
      <div className="absolute left-[26px] top-9 bottom-0 w-px bg-line-2" />

      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-navy">{item.label}</h4>
        {item.mapQ && (
          <a
            href={googleMapUrl(item.mapQ)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[11px] font-semibold text-info hover:underline"
          >
            地圖 ↗
          </a>
        )}
      </div>

      {hasMap && (
        <button
          onClick={() => setOpenMap((v) => !v)}
          className="mb-2 text-[11px] font-semibold text-muted hover:text-ink"
        >
          {openMap ? "▲ 收合地圖" : "▼ 展開地圖"}
        </button>
      )}
      {openMap && item.coords && (
        <div className="mb-3">
          <MapView coords={item.coords} mapQ={item.mapQ} label={item.label} />
        </div>
      )}

      {item.transport && item.transport.length > 0 && (
        <div className="mb-3 space-y-2">
          {item.transport.map((t, i) => (
            <div
              key={i}
              className={`rounded-md border p-2.5 text-xs ${
                t.recommended
                  ? "border-success/40 bg-success/5"
                  : "border-line bg-card-pure"
              }`}
            >
              <div className="mb-0.5 flex items-center gap-2">
                <span className="font-bold text-ink">🚆 {t.tool}</span>
                {t.recommended && (
                  <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                    推薦
                  </span>
                )}
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
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                {e.cost && <span className="text-ink-2">{e.cost}</span>}
                {e.mapQ && (
                  <a
                    href={googleMapUrl(e.mapQ)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto font-semibold text-info hover:underline"
                  >
                    地圖 ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {item.meals && item.meals.length > 0 && (
        <div className="mb-3 space-y-3">
          {item.meals.map((meal, i) => (
            <div key={i} className="rounded-md bg-gold-pale p-2.5">
              <div className="mb-2 text-[11px] font-bold text-gold">
                🍽 {meal.type}
              </div>
              <div className="space-y-2">
                {meal.options.map((opt, j) => (
                  <div
                    key={j}
                    className="rounded border border-line bg-card-pure p-2 text-xs"
                  >
                    {opt.headline && (
                      <div className="text-[11px] font-semibold text-gold">
                        {opt.headline}
                      </div>
                    )}
                    <div className="mt-0.5 font-bold text-ink">{opt.name}</div>
                    {opt.dishes && (
                      <div className="mt-0.5 text-muted">{opt.dishes}</div>
                    )}
                    {opt.desc && (
                      <div className="mt-0.5 text-[11px] text-muted">
                        {opt.desc}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      {opt.cost && (
                        <span className="text-ink-2">{opt.cost}</span>
                      )}
                      {opt.mapQ && (
                        <a
                          href={googleMapUrl(opt.mapQ)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto font-semibold text-info hover:underline"
                        >
                          地圖 ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

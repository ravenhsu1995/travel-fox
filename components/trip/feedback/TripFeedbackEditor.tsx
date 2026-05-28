"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Day, Rating, TimelineItem, Trip } from "@/lib/types";
import { RATINGS } from "@/lib/types";
import { normalizeDays } from "@/lib/timeline-compat";
import TimelineItemView from "../TimelineItemView";
import { MessageSquareIcon, SaveIcon } from "@/components/icons";

type Props = {
  initialTrip: Trip;
  initialDays: Day[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function TripFeedbackEditor({
  initialTrip,
  initialDays,
}: Props) {
  const sortedInitial = normalizeDays(initialDays).sort((a, b) => a.sort_order - b.sort_order);

  const [trip, setTrip] = useState(initialTrip);
  const [days, setDays] = useState<Day[]>(sortedInitial);
  const [activeIdx, setActiveIdx] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Last-known server-saved day, used to revert on PATCH failure. Seeded
  // from initial server data; updated after each successful save.
  const snapshotRef = useRef<Record<string, Day>>(
    Object.fromEntries(sortedInitial.map((d) => [d.id, d])),
  );
  // Latest in-memory day state, including edits not yet flushed. Reads
  // here win over closure-captured `days` so back-to-back clicks chain
  // correctly. Side-effects (fetch) live outside setDays.
  const latestRef = useRef<Record<string, Day>>(
    Object.fromEntries(sortedInitial.map((d) => [d.id, d])),
  );
  // Per-day save promise chain. New PATCH waits for previous to settle so
  // the DB never races: latest UI state == latest persisted state.
  const saveChainRef = useRef<Record<string, Promise<void>>>({});
  // Coalesce flag — while a save is already queued (chained but not yet
  // started), further clicks just mutate latestRef; the queued save will
  // pick up the freshest state when it runs. Once the save starts, the
  // flag clears so a subsequent click queues a new save behind it.
  // NOTE: No debounce/timer — every change is immediately queued so a
  // user can click a rating and instantly navigate away without losing
  // the edit (fetch is already initiated by the time unmount runs).
  const pendingRef = useRef<Record<string, boolean>>({});
  // Share-toggle serialization: version counter ignores stale responses,
  // chain guarantees server-side write order matches click order.
  const shareToggleChainRef = useRef<Promise<void>>(Promise.resolve());
  const shareToggleVersionRef = useRef(0);

  const active = days[activeIdx];

  function setTransient(next: SaveState, ms: number) {
    setSaveState(next);
    setTimeout(() => {
      setSaveState((curr) => (curr === next ? "idle" : curr));
    }, ms);
  }

  async function doSave(dayId: string): Promise<void> {
    const dayToSave = latestRef.current[dayId];
    if (!dayToSave) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/trips/${trip.id}/days/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: dayToSave.theme,
          hotel: dayToSave.hotel,
          timeline: dayToSave.timeline,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "儲存失敗");
      snapshotRef.current[dayId] = dayToSave;
      setTransient("saved", 1200);
    } catch {
      // Revert only if no newer edit landed while we were in flight —
      // otherwise the chained next save will reconcile the newer state
      // and a revert here would flash stale UI.
      if (latestRef.current[dayId] === dayToSave) {
        const snap = snapshotRef.current[dayId];
        if (snap) {
          latestRef.current[dayId] = snap;
          setDays((prev) => prev.map((d) => (d.id === dayId ? snap : d)));
        }
      }
      setTransient("error", 2000);
    }
  }

  function queueDaySave(dayId: string) {
    // Already queued (chained but hasn't picked up latestRef yet) — let
    // that pending save pick up the newest state when it runs.
    if (pendingRef.current[dayId]) return;
    pendingRef.current[dayId] = true;
    const prev = saveChainRef.current[dayId] ?? Promise.resolve();
    saveChainRef.current[dayId] = prev.then(async () => {
      // Clear *before* doSave reads latestRef, so a click while the
      // fetch is in flight queues a brand-new save behind this one.
      pendingRef.current[dayId] = false;
      await doSave(dayId);
    });
  }

  function updateItem(
    dayId: string,
    itemIdx: number,
    patch: Partial<Pick<TimelineItem, "rating" | "comment">>,
  ) {
    const source = latestRef.current[dayId];
    if (!source) return;
    const newTimeline = source.timeline.map((it, i) => {
      if (i !== itemIdx) return it;
      const merged: TimelineItem = { ...it, ...patch };
      if (merged.rating === undefined) delete merged.rating;
      if (!merged.comment || !merged.comment.trim()) delete merged.comment;
      return merged;
    });
    const newDay: Day = { ...source, timeline: newTimeline };
    latestRef.current[dayId] = newDay;
    setDays((prev) => prev.map((d) => (d.id === dayId ? newDay : d)));
    queueDaySave(dayId);
  }

  function toggleShareShow(next: boolean) {
    setTrip((t) => ({ ...t, share_show_feedback: next }));
    setSaveState("saving");
    const myVersion = ++shareToggleVersionRef.current;

    shareToggleChainRef.current = shareToggleChainRef.current.then(async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}/share-feedback`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ share_show_feedback: next }),
        });
        const json = (await res.json()) as { ok: boolean; error?: string };
        if (!json.ok) throw new Error(json.error || "儲存失敗");
        // Only emit "saved" badge for the latest click — stale successes
        // from earlier clicks shouldn't claim credit if the user has
        // since flipped again.
        if (myVersion === shareToggleVersionRef.current) {
          setTransient("saved", 1200);
        }
      } catch {
        // Only revert if this was the latest user intent. If a newer
        // toggle has fired, the chained next PATCH will reconcile and
        // an early revert here would just cause UI flicker.
        if (myVersion === shareToggleVersionRef.current) {
          setTrip((t) => ({ ...t, share_show_feedback: !next }));
          setTransient("error", 2000);
        }
      }
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      <div className="mx-auto flex w-full items-center justify-between px-4 pt-3">
        <Link
          href="/trips"
          className="inline-flex h-8 items-center text-sm font-semibold text-muted hover:text-ink"
        >
          ← 我的行程
        </Link>
        <SaveBadge state={saveState} />
      </div>

      <div className="bg-gradient-to-b from-navy to-navy-lt px-4 pt-3 pb-2 text-white">
        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold tracking-wide">
            {trip.cover_emoji} {trip.title}
          </h1>
          <p className="mt-0.5 truncate text-[11px] opacity-70">
            旅行後回饋 · {trip.start_date} – {trip.end_date}
          </p>
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-2">
          {days.map((d, i) => (
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

      <ShareToggleRow
        enabled={trip.share_show_feedback}
        visibility={trip.visibility}
        onChange={toggleShareShow}
      />

      {active && (
        <div className="space-y-4 px-4 py-5">
          {active.timeline.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-2 bg-card p-6 text-center text-sm text-muted">
              這一天沒有行程，無法回饋
            </div>
          ) : (
            <section className="rounded-xl bg-card p-4 pt-5 shadow-sm">
              <div className="space-y-6">
                {active.timeline.map((item, i) => (
                  <ItemFeedbackRow
                    key={i}
                    item={item}
                    onChange={(patch) => updateItem(active.id, i, patch)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  if (state === "idle") return <span className="h-8" aria-hidden />;
  const map: Record<Exclude<SaveState, "idle">, { text: string; cls: string }> = {
    saving: { text: "儲存中…", cls: "text-muted" },
    saved: { text: "已儲存", cls: "text-success" },
    error: { text: "儲存失敗", cls: "text-danger" },
  };
  const { text, cls } = map[state];
  return (
    <span className={`inline-flex h-8 items-center text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

function ShareToggleRow({
  enabled,
  visibility,
  onChange,
}: {
  enabled: boolean;
  visibility: Trip["visibility"];
  onChange: (next: boolean) => void;
}) {
  const isPrivate = visibility === "private";
  return (
    <div className="mx-4 mt-3 rounded-xl border border-line-2 bg-card p-3">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-pressed={enabled}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold text-ink">在分享頁面中顯示你的評價</div>
          <div className="mt-0.5 text-[11px] text-muted">
            {isPrivate
              ? "目前行程為私人，僅你能看到。打開後若改為「不公開連結」或「公開」，他人才看得到。"
              : "開啟後，拿到分享連結或從公開列表進入的人，也會看到你的評分與評語。"}
          </div>
        </div>
        <Switch on={enabled} />
      </button>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        on ? "bg-gold" : "bg-line-2"
      }`}
      aria-hidden
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function ItemFeedbackRow({
  item,
  onChange,
}: {
  item: TimelineItem;
  onChange: (patch: Partial<Pick<TimelineItem, "rating" | "comment">>) => void;
}) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [draft, setDraft] = useState(item.comment ?? "");

  function pickRating(r: Rating) {
    onChange({ rating: item.rating === r ? undefined : r });
  }

  function saveComment() {
    onChange({ comment: draft });
    setCommentOpen(false);
  }

  const hasComment = !!item.comment?.trim();

  return (
    <div>
      <TimelineItemView item={item} showFeedbackDecorations={false} />

      <div className="mt-2 pl-14">
        <div className="flex flex-wrap items-center gap-1.5">
          {RATINGS.map((r) => {
            const active = item.rating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => pickRating(r)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition ${
                  active
                    ? "border-gold bg-gold text-white shadow-sm"
                    : "border-line-2 bg-card-pure text-muted hover:bg-line-2"
                }`}
                aria-pressed={active}
              >
                {r}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setDraft(item.comment ?? "");
              setCommentOpen((v) => !v);
            }}
            className={`ml-auto flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition ${
              hasComment
                ? "bg-gold-pale text-gold"
                : "text-ink-2 hover:bg-card-pure"
            }`}
            aria-expanded={commentOpen}
          >
            <MessageSquareIcon />
            {hasComment ? "編輯評語" : "輸入評語"}
          </button>
        </div>

        {hasComment && !commentOpen && (
          <div className="mt-1.5 rounded-md border border-line-2 bg-card-pure p-2 text-[11px] text-ink-2">
            「{item.comment}」
          </div>
        )}

        {commentOpen && (
          <div className="mt-2 space-y-1.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="寫下這個行程的感受…"
              className="w-full resize-none rounded-md border border-line-2 bg-card-pure p-2 text-xs text-ink outline-none focus:border-gold"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDraft(item.comment ?? "");
                  setCommentOpen(false);
                }}
                className="h-8 rounded-lg px-2.5 text-xs font-semibold text-muted hover:bg-card-pure"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveComment}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-gold px-2.5 text-xs font-semibold text-white hover:bg-gold-lt"
              >
                <SaveIcon />
                儲存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

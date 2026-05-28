"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Currency,
  Day,
  ExperienceItem,
  HotelInfo,
  MealBlock,
  TimelineItem,
  TransportOption,
  Trip,
} from "@/lib/types";
import { CURRENCIES, CURRENCY_LABEL, CURRENCY_SYMBOL } from "@/lib/currency";
import {
  joinLocationChips,
  normalizeLocationChip,
  splitLocationChips,
} from "@/lib/location-chips";
import {
  resolveDayHotel,
  daysRemainingFrom,
  type ResolvedHotel,
} from "@/lib/resolveDayHotel";
import VisibilitySection from "./VisibilitySection";

type CostFields = {
  cost?: string;
  costAmount?: number;
  costCurrency?: Currency;
};

function validateCostFields(c: CostFields, where: string): string | null {
  if (typeof c.costAmount === "number" && c.costAmount > 0 && !c.costCurrency) {
    return `${where}：填了金額但未選擇幣別`;
  }
  return null;
}

function validateDay(day: Day): string | null {
  if (day.hotel) {
    const err = validateCostFields(day.hotel, `住宿（${day.hotel.name || "未命名"}）`);
    if (err) return err;
  }
  for (let i = 0; i < day.timeline.length; i++) {
    const it = day.timeline[i];
    const label = `第 ${i + 1} 個時段（${it.time}）`;
    if (it.transport) {
      const err = validateCostFields(it.transport, `${label} 交通`);
      if (err) return err;
    }
    if (it.meal) {
      const err = validateCostFields(it.meal, `${label} 餐飲`);
      if (err) return err;
    }
    if (it.exp) {
      const err = validateCostFields(it.exp, `${label} 體驗`);
      if (err) return err;
    }
  }
  return null;
}

function dayHasContent(day: Day): boolean {
  return Boolean(
    day.theme?.trim() ||
      day.hotel ||
      day.timeline.length > 0,
  );
}

function isDayInTripRange(day: Day, trip: Trip): boolean {
  return day.date >= trip.start_date && day.date <= trip.end_date;
}

type Props = {
  initialTrip: Trip;
  initialDays: Day[];
  initialDayId?: string;
};

async function readMutationResult<T extends { ok: true }>(
  res: Response,
  fallback: string,
): Promise<T | { ok: false; error: string }> {
  const data = (await res.json().catch(() => null)) as
    | T
    | { ok: false; error?: string }
    | null;
  const error = data?.ok === false ? data.error : undefined;
  if (!res.ok) {
    return { ok: false, error: error ?? fallback };
  }
  if (!data?.ok) {
    return { ok: false, error: error ?? fallback };
  }
  return data;
}

async function saveTripRequest(trip: Trip) {
  return readMutationResult<{ ok: true; days?: Day[] }>(
    await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trip.title,
        subtitle: trip.subtitle,
        cover_emoji: trip.cover_emoji,
        start_date: trip.start_date,
        end_date: trip.end_date,
      }),
    }),
    "儲存失敗",
  );
}

async function deleteTripRequest(tripId: string) {
  return readMutationResult<{ ok: true }>(
    await fetch(`/api/trips/${tripId}`, {
      method: "DELETE",
    }),
    "刪除失敗",
  );
}

async function saveDayRequest(
  tripId: string,
  day: Pick<Day, "id" | "theme" | "hotel" | "timeline">,
) {
  const res = await fetch(`/api/trips/${tripId}/days/${day.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      theme: day.theme,
      hotel: day.hotel,
      timeline: day.timeline,
    }),
  });
  const data = (await res.json()) as
    | { ok: true }
    | { ok: false; error?: string };

  if (!res.ok) {
    const error = "error" in data ? data.error : undefined;
    return { ok: false as const, error: error ?? "儲存失敗" };
  }
  if (!data.ok) {
    return { ok: false as const, error: data.error ?? "儲存失敗" };
  }

  return { ok: true as const };
}

async function addDayRequest(
  tripId: string,
  position: "before" | "after",
  relativeToDayId: string,
) {
  const res = await fetch(`/api/trips/${tripId}/days`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position, relativeToDayId }),
  });
  const data = (await res.json()) as
    | { ok: true; day: Day }
    | { ok: false; error?: string };

  if (!res.ok) {
    const error = "error" in data ? data.error : undefined;
    return { ok: false as const, error: error ?? "新增失敗" };
  }
  if (!data.ok) {
    return { ok: false as const, error: data.error ?? "新增失敗" };
  }

  return { ok: true as const, day: data.day };
}

async function deleteDayRequest(tripId: string, dayId: string) {
  const res = await fetch(`/api/trips/${tripId}/days/${dayId}`, {
    method: "DELETE",
  });
  const data = (await res.json()) as
    | { ok: true }
    | { ok: false; error?: string };

  if (!res.ok) {
    const error = "error" in data ? data.error : undefined;
    return { ok: false as const, error: error ?? "刪除失敗" };
  }
  if (!data.ok) {
    return { ok: false as const, error: data.error ?? "刪除失敗" };
  }

  return { ok: true as const };
}

export default function TripEditor({
  initialTrip,
  initialDays,
  initialDayId,
}: Props) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip>(initialTrip);
  const [days, setDays] = useState<Day[]>(initialDays);
  const [activeDayId, setActiveDayId] = useState<string>(
    initialDayId ?? initialDays[0]?.id ?? "",
  );
  const [savingTrip, startTripSave] = useTransition();
  const [savingDay, startDaySave] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );
  const [showTripForm, setShowTripForm] = useState(false);
  const [addingDay, setAddingDay] = useState(false);

  const active = days.find((d) => d.id === activeDayId);

  function flash(kind: "ok" | "err", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 2500);
  }

  function onTripSave() {
    const outOfRangeContentDays = days.filter(
      (day) => !isDayInTripRange(day, trip) && dayHasContent(day),
    );
    if (outOfRangeContentDays.length > 0) {
      const labels = outOfRangeContentDays
        .map((day) => day.day_label ?? day.date)
        .join("、");
      const confirmed = confirm(
        `新的行程日期不包含 ${labels}，但這些日期已有內容。\n\n儲存後內容會保留，不會自動刪除；你仍可之後手動刪除這些日期。\n\n要繼續儲存嗎？`,
      );
      if (!confirmed) return;
    }

    startTripSave(async () => {
      try {
        const r = await saveTripRequest(trip);
        if (r.ok) {
          if (r.days) {
            setDays(r.days);
            if (!r.days.some((day) => day.id === activeDayId)) {
              setActiveDayId(r.days[0]?.id ?? "");
            }
          }
          flash("ok", "行程資訊已儲存");
          setShowTripForm(false);
        } else flash("err", r.error);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        flash("err", `儲存失敗：${msg}`);
      }
    });
  }

  function onDaySave() {
    if (!active) return;
    const validationError = validateDay(active);
    if (validationError) {
      flash("err", validationError);
      return;
    }
    startDaySave(async () => {
      try {
        const r = await saveDayRequest(trip.id, active);
        if (!r.ok) {
          flash("err", r.error);
          return;
        }
        // If active day has nights > 1, also persist null on shadowed days
        const n = active.hotel?.nights ?? 1;
        if (n > 1) {
          const sorted = [...days].sort((a, b) => a.sort_order - b.sort_order);
          const idx = sorted.findIndex((d) => d.id === active.id);
          const shadowed = sorted.slice(idx + 1, idx + n);
          await Promise.all(
            shadowed.map((d) =>
              saveDayRequest(trip.id, {
                id: d.id,
                theme: d.theme,
                hotel: null,
                timeline: d.timeline,
              }),
            ),
          );
        }
        flash("ok", "此日已儲存");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        flash("err", `儲存失敗：${msg}`);
      }
    });
  }

  function updateActive(patch: Partial<Day>) {
    setDays((arr) =>
      arr.map((d) => (d.id === active?.id ? { ...d, ...patch } : d)),
    );
  }

  function onNightsChange(newN: number) {
    if (!active || !active.hotel) return;
    const sorted = [...days].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((d) => d.id === active.id);
    if (idx < 0) return;
    const maxN = sorted.length - idx;
    const clamped = Math.max(1, Math.min(newN, maxN));
    const sourceName = active.hotel.name;

    const conflicts: Day[] = [];
    for (let k = 1; k < clamped; k++) {
      const d = sorted[idx + k];
      if (d?.hotel && d.hotel.name && d.hotel.name !== sourceName) {
        conflicts.push(d);
      }
    }
    if (conflicts.length > 0) {
      const names = conflicts
        .map((d) => `${d.day_label ?? d.date} 已有「${d.hotel!.name}」`)
        .join("、");
      if (!confirm(`${names}，要覆蓋嗎？`)) return;
    }

    const shadowedIds = new Set<string>();
    for (let k = 1; k < clamped; k++) shadowedIds.add(sorted[idx + k].id);
    setDays((arr) =>
      arr.map((d) => {
        if (d.id === active.id && d.hotel) {
          return { ...d, hotel: { ...d.hotel, nights: clamped } };
        }
        if (shadowedIds.has(d.id)) return { ...d, hotel: null };
        return d;
      }),
    );

    // 若有覆蓋衝突，立即 PATCH 清掉伺服器上的資料，避免 reload 又回來
    for (const c of conflicts) {
      saveDayRequest(trip.id, {
        id: c.id,
        theme: c.theme,
        hotel: null,
        timeline: c.timeline,
      }).catch(() => {});
    }
  }

  function onDeleteTrip() {
    if (!confirm("確定要刪除這整個行程嗎？所有日程都會一併刪除。")) return;
    deleteTripRequest(trip.id).then((r) => {
      if (r.ok) router.push("/trips");
      else flash("err", r.error);
    });
  }

  const sortedDays = [...days].sort((a, b) => a.sort_order - b.sort_order);
  const firstDay = sortedDays[0];
  const lastDay = sortedDays[sortedDays.length - 1];

  function dateLabel(dateStr: string, offset: number) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + offset);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function onAddDay(position: "before" | "after") {
    const refDay = position === "before" ? firstDay : lastDay;
    if (!refDay) return;
    setAddingDay(false);
    addDayRequest(trip.id, position, refDay.id)
      .then((r) => {
        if (!r.ok) {
          flash("err", r.error);
          return;
        }
        const newDay = r.day as Day;
        setDays((prev) => {
          const refSortOrder = refDay.sort_order;
          const shifted = prev.map((d) =>
            (position === "after"
              ? d.sort_order > refSortOrder
              : d.sort_order >= refSortOrder)
              ? { ...d, sort_order: d.sort_order + 1 }
              : d,
          );
          return [...shifted, newDay].sort((a, b) => a.sort_order - b.sort_order);
        });
        setActiveDayId(newDay.id);
        flash("ok", "已新增一天");
      })
      .catch((e: unknown) =>
        flash("err", e instanceof Error ? e.message : "新增失敗，請重試"),
      );
  }

  function onDeleteDay() {
    if (!active) return;
    if (!confirm(`確定要刪除 ${active.day_label ?? active.date}？該天所有時段都會一併刪除。`)) return;
    deleteDayRequest(trip.id, active.id).then((r) => {
      if (!r.ok) {
        flash("err", r.error);
        return;
      }
      const remaining = days.filter((d) => d.id !== active.id);
      setDays(remaining);
      setActiveDayId(remaining[0]?.id ?? "");
      flash("ok", "已刪除此天");
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      <div
        className="sticky top-0 z-50 bg-gradient-to-b from-navy to-navy-lt px-4 pb-2 text-white shadow-md"
        style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between">
          <Link
            href={`/trips/${trip.id}`}
            className="text-xs font-semibold opacity-80 hover:opacity-100"
          >
            ← 回到檢視
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowTripForm((v) => !v)}
              className="rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25"
            >
              {showTripForm ? "收合行程資訊" : "✏️ 行程資訊"}
            </button>
          </div>
        </div>
        <h1 className="mt-2 text-lg font-extrabold">
          {trip.cover_emoji} {trip.title}
        </h1>
        <p className="text-[11px] opacity-70">
          {trip.start_date} – {trip.end_date}
          {trip.subtitle && ` · ${trip.subtitle}`}
        </p>

        {!showTripForm && (
          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-2">
            {addingDay && firstDay && (
              <button
                onClick={() => onAddDay("before")}
                className="flex-shrink-0 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/25"
              >
                ← {dateLabel(firstDay.date, -1)}
              </button>
            )}
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDayId(d.id)}
                className={`flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  d.id === activeDayId
                    ? "border-gold bg-gold text-white shadow-sm"
                    : "border-white/15 bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {d.day_label ?? d.date}
              </button>
            ))}
            {addingDay ? (
              <>
                {lastDay && (
                  <button
                    onClick={() => onAddDay("after")}
                    className="flex-shrink-0 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/25"
                  >
                    {dateLabel(lastDay.date, 1)} →
                  </button>
                )}
                <button
                  onClick={() => setAddingDay(false)}
                  className="flex-shrink-0 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/50 hover:bg-white/10"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={() => setAddingDay(true)}
                className="flex-shrink-0 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/15"
              >
                + 新增一天
              </button>
            )}
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`sticky top-[148px] z-40 mx-auto mt-2 w-full max-w-[420px] rounded-md px-3 py-2 text-sm shadow-md ${
            msg.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </div>
      )}

      {showTripForm && (
        <>
          <TripMetaForm
            trip={trip}
            setTrip={setTrip}
            saving={savingTrip}
            onSave={onTripSave}
            onDelete={onDeleteTrip}
          />
          <div className="px-4 pb-2">
            <VisibilitySection
              trip={trip}
              onChange={(patch) => setTrip({ ...trip, ...patch })}
              onFlash={flash}
            />
          </div>
        </>
      )}

      {!showTripForm && active && (
        <DayEditor
          day={active}
          resolved={resolveDayHotel(days, active.id)}
          daysRemaining={daysRemainingFrom(days, active.id)}
          onChange={updateActive}
          onJumpToSource={(id) => setActiveDayId(id)}
          onNightsChange={onNightsChange}
          saving={savingDay}
          onSave={onDaySave}
          onDelete={onDeleteDay}
        />
      )}
      {!showTripForm && !active && (
        <section className="px-4 py-10 text-center text-sm text-muted">
          這個行程還沒有任何一天，點上方「+ 新增一天」開始
        </section>
      )}
    </main>
  );
}

/* ─────────── Trip metadata form ─────────── */

function TripMetaForm({
  trip,
  setTrip,
  saving,
  onSave,
  onDelete,
}: {
  trip: Trip;
  setTrip: (t: Trip) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
}) {

  return (
    <section className="space-y-4 px-4 py-5">
      <Field label="封面 Emoji">
        <input
          value={trip.cover_emoji}
          onChange={(e) =>
            setTrip({ ...trip, cover_emoji: e.target.value || "🗺️" })
          }
          className="h-12 w-20 rounded-lg border border-line-2 bg-card-pure px-3 text-center text-xl outline-none focus:border-gold"
        />
      </Field>
      <Field label="行程標題">
        <input
          value={trip.title}
          onChange={(e) => setTrip({ ...trip, title: e.target.value })}
          className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
        />
      </Field>
      <Field label="遊玩地區">
        <CityChipsEditor
          value={trip.subtitle}
          onChange={(v) => setTrip({ ...trip, subtitle: v })}
          separator=" · "
          placeholder="例如：神戶，輸入後按＋"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="開始日期">
          <input
            type="date"
            value={trip.start_date}
            onChange={(e) => setTrip({ ...trip, start_date: e.target.value })}
            className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="結束日期">
          <input
            type="date"
            value={trip.end_date}
            onChange={(e) => setTrip({ ...trip, end_date: e.target.value })}
            className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
        </Field>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="h-11 flex-1 rounded-lg bg-gold text-sm font-semibold text-white shadow-md hover:bg-gold-lt disabled:opacity-50"
        >
          {saving ? "儲存中…" : "儲存行程資訊"}
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={onDelete}
          className="text-xs font-semibold text-danger hover:underline"
        >
          🗑️ 刪除整個行程
        </button>
      </div>
    </section>
  );
}

/* ─────────── Day editor ─────────── */

function DayEditor({
  day,
  resolved,
  daysRemaining,
  onChange,
  onJumpToSource,
  onNightsChange,
  saving,
  onSave,
  onDelete,
}: {
  day: Day;
  resolved: ResolvedHotel;
  daysRemaining: number;
  onChange: (p: Partial<Day>) => void;
  onJumpToSource: (id: string) => void;
  onNightsChange: (n: number) => void;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <section className="space-y-5 px-4 py-5">
      <Card>
        <div className="text-xs font-semibold text-muted">{day.day_label}</div>
        <div className="mt-2">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">遊玩地區</div>
          <CityChipsEditor
            value={day.theme}
            onChange={(v) => onChange({ theme: v })}
          />
        </div>
      </Card>

      <HotelEditor
        hotel={day.hotel}
        resolved={resolved}
        daysRemaining={daysRemaining}
        onChange={(h) => onChange({ hotel: h })}
        onJumpToSource={onJumpToSource}
        onNightsChange={onNightsChange}
      />

      <TimelineListEditor
        items={day.timeline}
        onChange={(t) => onChange({ timeline: t })}
      />

      <button
        onClick={onSave}
        disabled={saving}
        className="sticky bottom-3 z-10 h-12 w-full rounded-full bg-navy text-sm font-semibold text-white shadow-lg hover:bg-navy-lt disabled:opacity-50"
      >
        {saving ? "儲存中…" : "💾 儲存這一天"}
      </button>

      <div className="text-center">
        <button
          onClick={onDelete}
          className="text-xs font-semibold text-danger hover:underline"
        >
          🗑 刪除這一天
        </button>
      </div>
    </section>
  );
}

function HotelEditor({
  hotel,
  resolved,
  daysRemaining,
  onChange,
  onJumpToSource,
  onNightsChange,
}: {
  hotel: HotelInfo | null;
  resolved: ResolvedHotel;
  daysRemaining: number;
  onChange: (h: HotelInfo | null) => void;
  onJumpToSource: (id: string) => void;
  onNightsChange: (n: number) => void;
}) {
  // 連住後續日：唯讀，提供跳轉源頭
  if (
    (resolved.phase === "middle" || resolved.phase === "checkout") &&
    resolved.hotel &&
    resolved.sourceDayId
  ) {
    return (
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
        </div>
        <div className="text-sm font-semibold text-ink">
          {resolved.hotel.name}
        </div>
        <div className="mt-1 text-xs text-muted">
          本日為「{resolved.hotel.name}」第 {resolved.nightIndex} 晚 / 共{" "}
          {resolved.totalNights} 晚
        </div>
        <button
          onClick={() => onJumpToSource(resolved.sourceDayId!)}
          className="mt-2 inline-block text-xs font-semibold text-info hover:underline"
        >
          前往源頭編輯 →
        </button>
      </Card>
    );
  }

  if (!hotel) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
          <button
            onClick={() =>
              onChange({
                name: "",
                checkin: null,
                checkout: null,
                nights: 1,
              })
            }
            className="text-xs font-semibold text-gold hover:underline"
          >
            + 加入住宿
          </button>
        </div>
      </Card>
    );
  }

  const nights = hotel.nights ?? 1;
  const nightOptions = Array.from(
    { length: Math.max(1, daysRemaining) },
    (_, i) => i + 1,
  );

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
        <button
          onClick={() => onChange(null)}
          className="text-xs text-danger hover:underline"
        >
          移除
        </button>
      </div>
      <div className="space-y-2">
        <TextInput
          placeholder="住宿名稱"
          value={hotel.name}
          onChange={(v) => onChange({ ...hotel, name: v })}
        />
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-semibold text-muted">共幾晚</div>
          <select
            value={nights}
            onChange={(e) => onNightsChange(Number(e.target.value))}
            className="h-9 rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
          >
            {nightOptions.map((n) => (
              <option key={n} value={n}>
                {n} 晚
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="mb-1 text-[10px] font-semibold text-muted">Check-in ～</div>
            <TimePicker
              value={hotel.checkin ?? null}
              onChange={(v) => onChange({ ...hotel, checkin: v })}
              allowEmpty
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold text-muted">～ Check-out</div>
            <TimePicker
              value={hotel.checkout ?? null}
              onChange={(v) => onChange({ ...hotel, checkout: v })}
              allowEmpty
            />
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-semibold text-muted">費用</div>
          <CostFieldEditor
            amount={hotel.costAmount}
            currency={hotel.costCurrency}
            legacy={hotel.cost}
            onChange={(c) => onChange({ ...hotel, ...c })}
          />
        </div>
      </div>
    </Card>
  );
}

const TYPE_META: Record<
  TimelineItem["type"],
  { label: string; icon: string; badgeCls: string }
> = {
  transport: { label: "交通", icon: "🚆", badgeCls: "bg-success/15 text-success" },
  meal: { label: "餐飲", icon: "🍽", badgeCls: "bg-gold/15 text-gold" },
  exp: { label: "體驗", icon: "✨", badgeCls: "bg-info/15 text-info" },
};

function emptyByType(type: TimelineItem["type"]): TimelineItem {
  if (type === "transport")
    return { time: "09:00", type, transport: { tool: "", from: "", to: "" } };
  if (type === "meal")
    return { time: "09:00", type, meal: { type: "午餐", name: "" } };
  return { time: "09:00", type, exp: { spot: "" } };
}

function TimelineListEditor({
  items,
  onChange,
}: {
  items: TimelineItem[];
  onChange: (t: TimelineItem[]) => void;
}) {
  function addItem(type: TimelineItem["type"]) {
    onChange([...items, emptyByType(type)]);
  }
  function setItem(i: number, patch: Partial<TimelineItem>) {
    onChange(items.map((it, j) => (i === j ? { ...it, ...patch } : it)));
  }
  function removeItem(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }
  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-navy">⏱ 時間軸</h3>
      <div className="flex gap-2">
        {(["transport", "meal", "exp"] as const).map((t) => (
          <button
            key={t}
            onClick={() => addItem(t)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${TYPE_META[t].badgeCls} hover:opacity-80`}
          >
            + {TYPE_META[t].icon} {TYPE_META[t].label}
          </button>
        ))}
      </div>
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-line-2 bg-card-pure p-5 text-center text-xs text-muted">
          這一天還沒有時間安排，點上方按鈕新增交通／餐飲／體驗
        </div>
      )}
      {items.map((it, i) => (
        <TimelineItemEditor
          key={i}
          item={it}
          onChange={(p) => setItem(i, p)}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : undefined}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : undefined}
        />
      ))}
    </div>
  );
}

function TimelineItemEditor({
  item,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: TimelineItem;
  onChange: (p: Partial<TimelineItem>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const meta = TYPE_META[item.type];
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <TimePicker
          value={item.time}
          onChange={(v) => onChange({ time: v ?? "09:00" })}
        />
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badgeCls}`}
        >
          {meta.icon} {meta.label}
        </span>
        <div className="ml-auto flex gap-1 text-xs text-muted">
          {onMoveUp && (
            <button onClick={onMoveUp} className="rounded px-1 hover:bg-bg-2">
              ↑
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="rounded px-1 hover:bg-bg-2">
              ↓
            </button>
          )}
          <button
            onClick={onRemove}
            className="rounded px-1 text-danger hover:bg-danger/10"
          >
            ×
          </button>
        </div>
      </div>

      {item.type === "transport" && (
        <TransportEditor
          value={item.transport ?? { tool: "", from: "", to: "" }}
          onChange={(t) => onChange({ transport: t })}
        />
      )}
      {item.type === "meal" && (
        <MealEditor
          value={item.meal ?? { type: "午餐", name: "" }}
          onChange={(m) => onChange({ meal: m })}
        />
      )}
      {item.type === "exp" && (
        <ExpEditor
          value={item.exp ?? { spot: "" }}
          onChange={(e) => onChange({ exp: e })}
        />
      )}
    </Card>
  );
}

function CostFieldEditor({
  amount,
  currency,
  legacy,
  onChange,
}: {
  amount: number | undefined;
  currency: Currency | undefined;
  legacy: string | undefined;
  onChange: (next: CostFields) => void;
}) {
  const hasAmount = typeof amount === "number" && amount > 0;
  const missingCurrency = hasAmount && !currency;
  const inputCls =
    "h-9 w-full rounded-md border bg-card-pure px-2 text-xs outline-none focus:border-gold";
  const selectCls = `${inputCls} ${
    missingCurrency ? "border-danger" : "border-line-2"
  }`;

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          value={amount ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            const next = raw === "" ? undefined : Number(raw);
            onChange({
              cost: undefined,
              costAmount: Number.isFinite(next) ? next : undefined,
              costCurrency: currency,
            });
          }}
          placeholder="費用"
          className={`${inputCls} border-line-2`}
        />
        <select
          value={currency ?? ""}
          onChange={(e) => {
            const v = e.target.value as Currency | "";
            onChange({
              cost: undefined,
              costAmount: amount,
              costCurrency: v === "" ? undefined : v,
            });
          }}
          className={selectCls}
        >
          <option value="">幣別</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {CURRENCY_SYMBOL[c]} {c} • {CURRENCY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      {missingCurrency && (
        <div className="text-[10px] font-semibold text-danger">
          請選擇幣別
        </div>
      )}
      {legacy && !hasAmount && (
        <div className="flex items-center justify-between rounded-md bg-warning/10 px-2 py-1 text-[10px] text-warning">
          <span>原資料：「{legacy}」需重新輸入</span>
          <button
            type="button"
            onClick={() =>
              onChange({ cost: undefined, costAmount: undefined, costCurrency: undefined })
            }
            className="font-bold hover:underline"
          >
            清除
          </button>
        </div>
      )}
    </div>
  );
}

function TransportEditor({
  value,
  onChange,
}: {
  value: TransportOption;
  onChange: (t: TransportOption) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2.5">
      <SelectOrCustom
        value={value.tool}
        options={TRANSPORT_TOOL_PRESETS}
        onChange={(v) => onChange({ ...value, tool: v })}
        placeholder="選擇交通工具"
      />
      <div className="grid grid-cols-2 gap-2">
        <TextInput
          placeholder="從"
          value={value.from}
          onChange={(v) => onChange({ ...value, from: v })}
        />
        <TextInput
          placeholder="到"
          value={value.to}
          onChange={(v) => onChange({ ...value, to: v })}
        />
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold text-muted">耗時</div>
        <DurationPicker
          value={value.duration}
          onChange={(v) => onChange({ ...value, duration: v })}
        />
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold text-muted">費用</div>
        <CostFieldEditor
          amount={value.costAmount}
          currency={value.costCurrency}
          legacy={value.cost}
          onChange={(c) => onChange({ ...value, ...c })}
        />
      </div>
      <TextArea
        placeholder="備註（服務／路線名稱）"
        value={value.note ?? ""}
        onChange={(v) => onChange({ ...value, note: v || undefined })}
      />
    </div>
  );
}

function MealEditor({
  value,
  onChange,
}: {
  value: MealBlock;
  onChange: (m: MealBlock) => void;
}) {
  return (
    <div className="space-y-2 rounded-md bg-gold-pale p-2.5">
      <SelectOrCustom
        value={value.type}
        options={MEAL_TYPE_PRESETS}
        onChange={(v) => onChange({ ...value, type: v })}
        placeholder="選擇餐型"
      />
      <TextInput
        placeholder="餐廳名稱"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: v })}
      />
      <TextArea
        placeholder="吃了什麼"
        value={value.dishes ?? ""}
        onChange={(v) => onChange({ ...value, dishes: v || undefined })}
      />
      <div>
        <div className="mb-1 text-[10px] font-semibold text-muted">費用</div>
        <CostFieldEditor
          amount={value.costAmount}
          currency={value.costCurrency}
          legacy={value.cost}
          onChange={(c) => onChange({ ...value, ...c })}
        />
      </div>
    </div>
  );
}

function ExpEditor({
  value,
  onChange,
}: {
  value: ExperienceItem;
  onChange: (e: ExperienceItem) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-line bg-card-pure p-2.5">
      <TextInput
        placeholder="景點/體驗名稱"
        value={value.spot}
        onChange={(v) => onChange({ ...value, spot: v })}
      />

      <TextArea
        placeholder="描述"
        value={value.desc ?? ""}
        onChange={(v) => onChange({ ...value, desc: v || undefined })}
      />
      <div>
        <div className="mb-1 text-[10px] font-semibold text-muted">費用</div>
        <CostFieldEditor
          amount={value.costAmount}
          currency={value.costCurrency}
          legacy={value.cost}
          onChange={(c) => onChange({ ...value, ...c })}
        />
      </div>
    </div>
  );
}

/* ─────────── primitives ─────────── */

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-xl bg-card p-4 shadow-sm">{children}</section>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
    />
  );
}


const MEAL_TYPE_PRESETS = ["早餐", "午餐", "下午茶", "晚餐", "點心", "飲料", "路邊小攤", "宵夜"];
const TRANSPORT_TOOL_PRESETS = ["飛機", "鐵道", "巴士", "自駕", "船", "步行"];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

function TimePicker({
  value,
  onChange,
  allowEmpty = false,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  allowEmpty?: boolean;
}) {
  const [h, m] = value ? value.split(":") : ["", ""];
  function set(nextH: string, nextM: string) {
    if (!nextH && !nextM) {
      onChange(null);
      return;
    }
    onChange(`${nextH || "00"}:${nextM || "00"}`);
  }
  const selectCls =
    "h-9 rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold";
  return (
    <div className="flex items-center gap-1">
      <select
        value={h}
        onChange={(e) => set(e.target.value, m || "00")}
        className={selectCls}
      >
        {allowEmpty && <option value="">時</option>}
        {HOURS.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      <span className="text-muted">:</span>
      <select
        value={m}
        onChange={(e) => set(h || "00", e.target.value)}
        className={selectCls}
      >
        {allowEmpty && <option value="">分</option>}
        {MINUTES.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-muted hover:text-danger"
        >
          清除
        </button>
      )}
    </div>
  );
}

function CityChipsEditor({
  value,
  onChange,
  separator = " • ",
  placeholder = "例如：神戶，輸入後按＋",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  separator?: string;
  placeholder?: string;
}) {
  const cities = splitLocationChips(value);
  const [draft, setDraft] = useState("");
  function commit(next: string[]) {
    onChange(joinLocationChips(next, separator));
  }
  function add() {
    const v = normalizeLocationChip(draft);
    if (!v) return;
    commit([...cities, v]);
    setDraft("");
  }
  function remove(i: number) {
    commit(cities.filter((_, j) => j !== i));
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {cities.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-gold-pale px-2.5 py-0.5 text-xs font-semibold text-ink"
          >
            {c}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-9 flex-1 rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="h-9 rounded-md bg-navy px-4 text-xs font-semibold text-white hover:bg-navy-lt disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SelectOrCustom({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const isCustom = value !== "" && !options.includes(value);
  const [customMode, setCustomMode] = useState(isCustom);
  const showingCustom = customMode || isCustom;

  function onSelect(v: string) {
    if (v === "__other__") {
      setCustomMode(true);
      onChange("");
    } else {
      setCustomMode(false);
      onChange(v);
    }
  }

  return (
    <div className="space-y-2">
      <select
        value={showingCustom ? "__other__" : value}
        onChange={(e) => onSelect(e.target.value)}
        className="h-9 w-full rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="__other__">其他…</option>
      </select>
      {showingCustom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="自訂"
          className="h-9 w-full rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
        />
      )}
    </div>
  );
}

function parseDuration(s: string | undefined): { h: number; m: number } {
  if (!s) return { h: 0, m: 0 };
  const hm = s.match(/^(\d+)h(\d+)m$/i);
  if (hm) return { h: +hm[1], m: +hm[2] };
  const hOnly = s.match(/^(\d+)h$/i);
  if (hOnly) return { h: +hOnly[1], m: 0 };
  const mOnly = s.match(/^(\d+)(?:min|m)$/i);
  if (mOnly) return { h: 0, m: +mOnly[1] };
  const bare = s.match(/^(\d+)$/);
  if (bare) return { h: 0, m: +bare[1] };
  return { h: 0, m: 0 };
}
function formatDuration(h: number, m: number): string | undefined {
  if (!h && !m) return undefined;
  if (!h) return `${m}min`;
  if (!m) return `${h}h`;
  return `${h}h${m}m`;
}

function DurationPicker({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const { h, m } = parseDuration(value);
  const numCls =
    "h-9 w-16 rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold";
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        max={48}
        value={h || ""}
        onChange={(e) => onChange(formatDuration(+e.target.value || 0, m))}
        placeholder="0"
        className={numCls}
      />
      <span className="text-xs text-muted">h</span>
      <input
        type="number"
        min={0}
        max={59}
        value={m || ""}
        onChange={(e) => onChange(formatDuration(h, +e.target.value || 0))}
        placeholder="0"
        className={numCls}
      />
      <span className="text-xs text-muted">min</span>
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-md border border-line-2 bg-card-pure px-2 py-1.5 text-xs outline-none focus:border-gold resize-y"
    />
  );
}

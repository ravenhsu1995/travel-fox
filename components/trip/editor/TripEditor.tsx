"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Day,
  ExperienceItem,
  HotelInfo,
  MealBlock,
  TimelineItem,
  TransportOption,
  Trip,
} from "@/lib/types";
import { saveDay, saveTrip, deleteTrip } from "@/app/trips/[tripId]/edit/actions";

type Props = {
  initialTrip: Trip;
  initialDays: Day[];
  initialDayId?: string;
};

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

  const active = days.find((d) => d.id === activeDayId);

  function flash(kind: "ok" | "err", text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 2500);
  }

  function onTripSave() {
    startTripSave(async () => {
      const r = await saveTrip({
        id: trip.id,
        title: trip.title,
        subtitle: trip.subtitle,
        cover_emoji: trip.cover_emoji,
        start_date: trip.start_date,
        end_date: trip.end_date,
      });
      if (r.ok) {
        flash("ok", "行程資訊已儲存");
        setShowTripForm(false);
      } else flash("err", r.error);
    });
  }

  function onDaySave() {
    if (!active) return;
    startDaySave(async () => {
      const r = await saveDay({
        id: active.id,
        trip_id: trip.id,
        theme: active.theme,
        hotel: active.hotel,
        timeline: active.timeline,
      });
      if (r.ok) flash("ok", "此日已儲存");
      else flash("err", r.error);
    });
  }

  function updateActive(patch: Partial<Day>) {
    setDays((arr) =>
      arr.map((d) => (d.id === active?.id ? { ...d, ...patch } : d)),
    );
  }

  function onDeleteTrip() {
    if (!confirm("確定要刪除這整個行程嗎？所有日程都會一併刪除。")) return;
    deleteTrip(trip.id).then((r) => {
      if (r.ok) router.push("/trips");
      else flash("err", r.error);
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      <div className="sticky top-14 z-20 bg-gradient-to-b from-navy to-navy-lt px-4 pt-3 pb-2 text-white">
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
          </div>
        )}
      </div>

      {msg && (
        <div
          className={`sticky top-[148px] z-10 mx-auto mt-2 w-full max-w-[420px] rounded-md px-3 py-2 text-sm shadow-md ${
            msg.kind === "ok"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </div>
      )}

      {showTripForm && (
        <TripMetaForm
          trip={trip}
          setTrip={setTrip}
          saving={savingTrip}
          onSave={onTripSave}
          onDelete={onDeleteTrip}
        />
      )}

      {!showTripForm && active && (
        <DayEditor
          day={active}
          onChange={updateActive}
          saving={savingDay}
          onSave={onDaySave}
        />
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
      <Field label="副標題">
        <input
          value={trip.subtitle ?? ""}
          onChange={(e) => setTrip({ ...trip, subtitle: e.target.value || null })}
          className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
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

      <details className="pt-4 text-xs text-muted">
        <summary className="cursor-pointer">危險區</summary>
        <button
          onClick={onDelete}
          className="mt-2 rounded-md border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
        >
          刪除整個行程
        </button>
      </details>
    </section>
  );
}

/* ─────────── Day editor ─────────── */

function DayEditor({
  day,
  onChange,
  saving,
  onSave,
}: {
  day: Day;
  onChange: (p: Partial<Day>) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <section className="space-y-5 px-4 py-5">
      <Card>
        <div className="text-xs font-semibold text-muted">{day.day_label}</div>
        <div className="mt-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">城市</div>
          <input
            value={day.theme ?? ""}
            onChange={(e) => onChange({ theme: e.target.value || null })}
            placeholder="例：桃園 • 神戶"
            className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-lt"
          />
        </div>
      </Card>

      <HotelEditor
        hotel={day.hotel}
        onChange={(h) => onChange({ hotel: h })}
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
    </section>
  );
}

function HotelEditor({
  hotel,
  onChange,
}: {
  hotel: HotelInfo | null;
  onChange: (h: HotelInfo | null) => void;
}) {
  if (!hotel) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">🏨 住宿</h3>
          <button
            onClick={() =>
              onChange({ name: "", checkin: null, checkout: null, cost: "" })
            }
            className="text-xs font-semibold text-gold hover:underline"
          >
            + 加入住宿
          </button>
        </div>
      </Card>
    );
  }
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
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            placeholder="Check-in（如 16:00）"
            value={hotel.checkin ?? ""}
            onChange={(v) => onChange({ ...hotel, checkin: v || null })}
          />
          <TextInput
            placeholder="Check-out"
            value={hotel.checkout ?? ""}
            onChange={(v) => onChange({ ...hotel, checkout: v || null })}
          />
        </div>
        <TextInput
          placeholder="費用備註"
          value={hotel.cost ?? ""}
          onChange={(v) => onChange({ ...hotel, cost: v })}
        />
        <TextInput
          placeholder="地圖搜尋字串"
          value={hotel.mapQ ?? ""}
          onChange={(v) => onChange({ ...hotel, mapQ: v })}
        />
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
        <input
          value={item.time}
          onChange={(e) => onChange({ time: e.target.value })}
          placeholder="時間"
          className="h-8 w-20 rounded bg-gold px-2 text-xs font-bold text-white outline-none"
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

function TransportEditor({
  value,
  onChange,
}: {
  value: TransportOption;
  onChange: (t: TransportOption) => void;
}) {
  return (
    <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2.5">
      <TextInput
        placeholder="工具（例：飛機 / JR / 巴士 / 自駕）"
        value={value.tool}
        onChange={(v) => onChange({ ...value, tool: v })}
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
        <TextInput
          placeholder="耗時（例：2h10m / 35min）"
          value={value.duration ?? ""}
          onChange={(v) => onChange({ ...value, duration: v || undefined })}
        />
        <TextInput
          placeholder="費用"
          value={value.cost ?? ""}
          onChange={(v) => onChange({ ...value, cost: v || undefined })}
        />
      </div>
      <TextInput
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
      <TextInput
        placeholder="餐型（例：早餐 / 午餐 / 下午茶 / 晚餐）"
        value={value.type}
        onChange={(v) => onChange({ ...value, type: v })}
      />
      <TextInput
        placeholder="餐廳名稱"
        value={value.name}
        onChange={(v) => onChange({ ...value, name: v })}
      />
      <TextInput
        placeholder="吃了什麼"
        value={value.dishes ?? ""}
        onChange={(v) => onChange({ ...value, dishes: v || undefined })}
      />
      <TextInput
        placeholder="費用"
        value={value.cost ?? ""}
        onChange={(v) => onChange({ ...value, cost: v || undefined })}
      />
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
      <TextInput
        placeholder="標語"
        value={value.headline ?? ""}
        onChange={(v) => onChange({ ...value, headline: v || undefined })}
      />
      <TextInput
        placeholder="描述"
        value={value.desc ?? ""}
        onChange={(v) => onChange({ ...value, desc: v || undefined })}
      />
      <TextInput
        placeholder="費用"
        value={value.cost ?? ""}
        onChange={(v) => onChange({ ...value, cost: v || undefined })}
      />
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


"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Day,
  ExperienceItem,
  HotelInfo,
  MealBlock,
  MealOption,
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
        companions: trip.companions,
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
        risks: active.risks,
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
  const [companionInput, setCompanionInput] = useState("");

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

      <Field label="同行者">
        <div className="flex flex-wrap gap-1.5">
          {trip.companions.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-gold-pale px-2.5 py-1 text-xs font-semibold text-gold"
            >
              {c}
              <button
                onClick={() =>
                  setTrip({
                    ...trip,
                    companions: trip.companions.filter((x) => x !== c),
                  })
                }
                className="text-gold/60 hover:text-gold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={companionInput}
            onChange={(e) => setCompanionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = companionInput.trim();
                if (trimmed && !trip.companions.includes(trimmed)) {
                  setTrip({ ...trip, companions: [...trip.companions, trimmed] });
                }
                setCompanionInput("");
              }
            }}
            placeholder="輸入名字後按 Enter"
            className="h-10 flex-1 rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
        </div>
      </Field>

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
        <input
          value={day.theme ?? ""}
          onChange={(e) => onChange({ theme: e.target.value || null })}
          placeholder="這一天的主題（例：入境 → 神戶）"
          className="mt-2 w-full bg-transparent text-lg font-extrabold text-navy outline-none placeholder:text-muted-lt"
        />
      </Card>

      <HotelEditor
        hotel={day.hotel}
        onChange={(h) => onChange({ hotel: h })}
      />

      <RisksEditor
        risks={day.risks}
        onChange={(r) => onChange({ risks: r })}
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
        <TextInput
          placeholder="訂房連結 URL"
          value={hotel.url ?? ""}
          onChange={(v) => onChange({ ...hotel, url: v })}
        />
      </div>
    </Card>
  );
}

function RisksEditor({
  risks,
  onChange,
}: {
  risks: string[];
  onChange: (r: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <Card>
      <h3 className="mb-2 text-sm font-bold text-warning">⚠️ 注意事項</h3>
      <ul className="space-y-1.5">
        {risks.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-ink-2">
            <span className="text-warning">•</span>
            <span className="flex-1">{r}</span>
            <button
              onClick={() => onChange(risks.filter((_, j) => j !== i))}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = input.trim();
              if (v) {
                onChange([...risks, v]);
                setInput("");
              }
            }
          }}
          placeholder="加入一條提醒（Enter 送出）"
          className="h-9 flex-1 rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
        />
      </div>
    </Card>
  );
}

function TimelineListEditor({
  items,
  onChange,
}: {
  items: TimelineItem[];
  onChange: (t: TimelineItem[]) => void;
}) {
  function addItem() {
    onChange([
      ...items,
      { time: "09:00", label: "新時段", transport: [], meals: [], exps: [] },
    ]);
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">⏱ 時間軸</h3>
        <button
          onClick={addItem}
          className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white hover:bg-gold-lt"
        >
          + 新增時段
        </button>
      </div>
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-line-2 bg-card-pure p-5 text-center text-xs text-muted">
          這一天還沒有時間安排，點上方「新增時段」開始
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
  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <input
          value={item.time}
          onChange={(e) => onChange({ time: e.target.value })}
          placeholder="時間"
          className="h-8 w-20 rounded bg-gold px-2 text-xs font-bold text-white outline-none"
        />
        <input
          value={item.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="標題"
          className="h-8 flex-1 rounded border border-line-2 bg-card-pure px-2 text-sm font-bold text-navy outline-none focus:border-gold"
        />
        <div className="flex gap-1 text-xs text-muted">
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

      <TextInput
        placeholder="地圖搜尋字串（mapQ，可空）"
        value={item.mapQ ?? ""}
        onChange={(v) => onChange({ mapQ: v || undefined })}
      />
      <CoordsInput
        value={item.coords}
        onChange={(c) => onChange({ coords: c })}
      />

      <TransportListEditor
        list={item.transport ?? []}
        onChange={(t) => onChange({ transport: t })}
      />
      <MealsListEditor
        list={item.meals ?? []}
        onChange={(m) => onChange({ meals: m })}
      />
      <ExpsListEditor
        list={item.exps ?? []}
        onChange={(e) => onChange({ exps: e })}
      />
    </Card>
  );
}

function TransportListEditor({
  list,
  onChange,
}: {
  list: TransportOption[];
  onChange: (t: TransportOption[]) => void;
}) {
  function add() {
    onChange([
      ...list,
      { tool: "", from: "", to: "", duration: "", cost: "", note: "" },
    ]);
  }
  return (
    <SubSection
      title="🚆 交通選項"
      count={list.length}
      onAdd={add}
      addLabel="+ 加交通"
    >
      {list.map((t, i) => (
        <div key={i} className="space-y-1.5 rounded-md border border-line bg-card-pure p-2.5">
          <div className="flex gap-2">
            <TextInput
              placeholder="工具（如：飛機/JR/巴士）"
              value={t.tool}
              onChange={(v) => onChange(list.map((x, j) => (j === i ? { ...x, tool: v } : x)))}
            />
            <button
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="text-danger"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              placeholder="from"
              value={t.from}
              onChange={(v) =>
                onChange(list.map((x, j) => (j === i ? { ...x, from: v } : x)))
              }
            />
            <TextInput
              placeholder="to"
              value={t.to}
              onChange={(v) =>
                onChange(list.map((x, j) => (j === i ? { ...x, to: v } : x)))
              }
            />
            <TextInput
              placeholder="耗時"
              value={t.duration ?? ""}
              onChange={(v) =>
                onChange(
                  list.map((x, j) => (j === i ? { ...x, duration: v } : x)),
                )
              }
            />
            <TextInput
              placeholder="費用"
              value={t.cost ?? ""}
              onChange={(v) =>
                onChange(list.map((x, j) => (j === i ? { ...x, cost: v } : x)))
              }
            />
          </div>
          <TextInput
            placeholder="備註"
            value={t.note ?? ""}
            onChange={(v) =>
              onChange(list.map((x, j) => (j === i ? { ...x, note: v } : x)))
            }
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={!!t.recommended}
              onChange={(e) =>
                onChange(
                  list.map((x, j) =>
                    j === i ? { ...x, recommended: e.target.checked } : x,
                  ),
                )
              }
            />
            標為推薦
          </label>
        </div>
      ))}
    </SubSection>
  );
}

function MealsListEditor({
  list,
  onChange,
}: {
  list: MealBlock[];
  onChange: (m: MealBlock[]) => void;
}) {
  function addBlock() {
    onChange([...list, { type: "餐", options: [] }]);
  }
  function setBlock(i: number, b: MealBlock) {
    onChange(list.map((x, j) => (j === i ? b : x)));
  }
  function removeBlock(i: number) {
    onChange(list.filter((_, j) => j !== i));
  }
  return (
    <SubSection
      title="🍽 餐廳區段"
      count={list.length}
      onAdd={addBlock}
      addLabel="+ 加餐廳區段"
    >
      {list.map((b, i) => (
        <div key={i} className="space-y-2 rounded-md bg-gold-pale p-2.5">
          <div className="flex gap-2">
            <TextInput
              placeholder="區段類型（如：午餐 / 晚餐）"
              value={b.type}
              onChange={(v) => setBlock(i, { ...b, type: v })}
            />
            <button
              onClick={() => removeBlock(i)}
              className="text-danger"
            >
              ×
            </button>
          </div>
          <MealOptionsEditor
            options={b.options}
            onChange={(opts) => setBlock(i, { ...b, options: opts })}
          />
        </div>
      ))}
    </SubSection>
  );
}

function MealOptionsEditor({
  options,
  onChange,
}: {
  options: MealOption[];
  onChange: (o: MealOption[]) => void;
}) {
  function add() {
    onChange([...options, { name: "" }]);
  }
  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="space-y-1.5 rounded border border-line bg-card-pure p-2">
          <div className="flex gap-2">
            <TextInput
              placeholder="店名"
              value={opt.name}
              onChange={(v) =>
                onChange(options.map((x, j) => (j === i ? { ...x, name: v } : x)))
              }
            />
            <button
              onClick={() => onChange(options.filter((_, j) => j !== i))}
              className="text-danger"
            >
              ×
            </button>
          </div>
          <TextInput
            placeholder="標語（例：神戶牛鐵板燒）"
            value={opt.headline ?? ""}
            onChange={(v) =>
              onChange(
                options.map((x, j) => (j === i ? { ...x, headline: v } : x)),
              )
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <TextInput
              placeholder="費用"
              value={opt.cost ?? ""}
              onChange={(v) =>
                onChange(options.map((x, j) => (j === i ? { ...x, cost: v } : x)))
              }
            />
            <TextInput
              placeholder="招牌菜"
              value={opt.dishes ?? ""}
              onChange={(v) =>
                onChange(
                  options.map((x, j) => (j === i ? { ...x, dishes: v } : x)),
                )
              }
            />
          </div>
          <TextInput
            placeholder="描述"
            value={opt.desc ?? ""}
            onChange={(v) =>
              onChange(options.map((x, j) => (j === i ? { ...x, desc: v } : x)))
            }
          />
          <TextInput
            placeholder="地圖搜尋字串"
            value={opt.mapQ ?? ""}
            onChange={(v) =>
              onChange(options.map((x, j) => (j === i ? { ...x, mapQ: v } : x)))
            }
          />
        </div>
      ))}
      <button
        onClick={add}
        className="w-full rounded border border-dashed border-line-2 py-1.5 text-xs font-semibold text-muted hover:border-gold hover:text-gold"
      >
        + 加餐廳選項
      </button>
    </div>
  );
}

function ExpsListEditor({
  list,
  onChange,
}: {
  list: ExperienceItem[];
  onChange: (e: ExperienceItem[]) => void;
}) {
  function add() {
    onChange([...list, { spot: "" }]);
  }
  return (
    <SubSection
      title="✨ 體驗"
      count={list.length}
      onAdd={add}
      addLabel="+ 加體驗"
    >
      {list.map((e, i) => (
        <div key={i} className="space-y-1.5 rounded-md border border-line bg-card-pure p-2.5">
          <div className="flex gap-2">
            <TextInput
              placeholder="景點/體驗名稱"
              value={e.spot}
              onChange={(v) =>
                onChange(list.map((x, j) => (j === i ? { ...x, spot: v } : x)))
              }
            />
            <button
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="text-danger"
            >
              ×
            </button>
          </div>
          <TextInput
            placeholder="標語"
            value={e.headline ?? ""}
            onChange={(v) =>
              onChange(list.map((x, j) => (j === i ? { ...x, headline: v } : x)))
            }
          />
          <TextInput
            placeholder="費用"
            value={e.cost ?? ""}
            onChange={(v) =>
              onChange(list.map((x, j) => (j === i ? { ...x, cost: v } : x)))
            }
          />
          <TextInput
            placeholder="描述"
            value={e.desc ?? ""}
            onChange={(v) =>
              onChange(list.map((x, j) => (j === i ? { ...x, desc: v } : x)))
            }
          />
          <TextInput
            placeholder="地圖搜尋字串"
            value={e.mapQ ?? ""}
            onChange={(v) =>
              onChange(list.map((x, j) => (j === i ? { ...x, mapQ: v } : x)))
            }
          />
        </div>
      ))}
    </SubSection>
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

function CoordsInput({
  value,
  onChange,
}: {
  value?: [number, number];
  onChange: (v: [number, number] | undefined) => void;
}) {
  const lat = value?.[0] ?? "";
  const lng = value?.[1] ?? "";
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        type="number"
        step="0.0001"
        value={lat}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (Number.isNaN(n)) onChange(undefined);
          else onChange([n, Number(lng) || 0]);
        }}
        placeholder="緯度"
        className="h-9 w-full rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
      />
      <input
        type="number"
        step="0.0001"
        value={lng}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (Number.isNaN(n)) onChange(undefined);
          else onChange([Number(lat) || 0, n]);
        }}
        placeholder="經度"
        className="h-9 w-full rounded-md border border-line-2 bg-card-pure px-2 text-xs outline-none focus:border-gold"
      />
    </div>
  );
}

function SubSection({
  title,
  count,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <details className="mt-3 rounded-md bg-bg-2 p-2.5" open={count > 0}>
      <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-ink-2">
        <span>
          {title}{" "}
          <span className="font-normal text-muted">({count})</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAdd();
          }}
          className="rounded bg-navy px-2 py-0.5 text-[10px] font-semibold text-white"
        >
          {addLabel}
        </button>
      </summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}

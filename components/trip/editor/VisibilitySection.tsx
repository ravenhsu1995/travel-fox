"use client";

import { useState, useTransition } from "react";
import type { Trip, Visibility } from "@/lib/types";
import ShareButton from "@/components/trip/ShareButton";

type Props = {
  trip: Trip;
  onChange: (
    patch: Pick<Trip, "visibility" | "share_token" | "public_display_name">,
  ) => void;
  onFlash: (kind: "ok" | "err", text: string) => void;
};

const OPTIONS: { value: Visibility; icon: string; title: string; desc: string }[] = [
  { value: "private", icon: "🔒", title: "私人", desc: "只有你能看" },
  { value: "unlisted", icon: "🔗", title: "非公開", desc: "有連結的人都能看" },
  { value: "public", icon: "🌍", title: "公開", desc: "出現在範例行程列表" },
];

type ApiResult =
  | {
      ok: true;
      visibility: Visibility;
      share_token: string | null;
      public_display_name: string | null;
    }
  | { ok: false; error?: string };

export default function VisibilitySection({ trip, onChange, onFlash }: Props) {
  const [picked, setPicked] = useState<Visibility>(trip.visibility);
  const [name, setName] = useState<string>(trip.public_display_name ?? "");
  const [saving, startSave] = useTransition();

  const dirty =
    picked !== trip.visibility ||
    (picked === "public" &&
      (name.trim() || null) !== (trip.public_display_name ?? null));

  function onSave() {
    startSave(async () => {
      let data: ApiResult;
      try {
        const res = await fetch(`/api/trips/${trip.id}/visibility`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visibility: picked,
            public_display_name: picked === "public" ? name : null,
          }),
        });
        const body = (await res.json().catch(() => null)) as ApiResult | null;
        if (!res.ok || !body || !body.ok) {
          const err =
            (body && "error" in body && body.error) || `HTTP ${res.status}`;
          onFlash("err", `可見性更新失敗：${err}`);
          return;
        }
        data = body;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onFlash("err", `可見性更新失敗：${msg}`);
        return;
      }

      onChange({
        visibility: data.visibility,
        share_token: data.share_token,
        public_display_name: data.public_display_name,
      });
      onFlash("ok", flashMessage(data.visibility));
    });
  }

  return (
    <section className="space-y-3 rounded-xl border border-line-2 bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">可見性</h2>
        {trip.visibility !== "private" && (
          <ShareButton trip={trip} variant="view" />
        )}
      </div>

      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              picked === opt.value
                ? "border-gold bg-gold/5"
                : "border-line-2 hover:bg-card-pure"
            }`}
          >
            <input
              type="radio"
              name="visibility"
              value={opt.value}
              checked={picked === opt.value}
              onChange={() => setPicked(opt.value)}
              className="mt-0.5 accent-gold"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">
                <span className="mr-1">{opt.icon}</span>
                {opt.title}
              </div>
              <div className="text-[11px] text-muted">{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>

      {picked === "public" && (
        <div>
          <label className="text-[11px] font-semibold text-muted">
            顯示名稱（在範例行程卡片顯示，留空 = 匿名狐狸）
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="例如：芒果狐狸"
            className="mt-1 h-10 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
        </div>
      )}

      {picked !== trip.visibility &&
        trip.visibility === "unlisted" &&
        (picked === "private" || picked === "public") && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            ⚠️ 切換後現有的分享連結會永久失效（再次切回非公開會產生新連結）。
          </p>
        )}

      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="h-10 w-full rounded-lg bg-navy text-sm font-semibold text-white shadow-sm hover:bg-navy-lt disabled:opacity-50"
      >
        {saving ? "更新中…" : "更新可見性"}
      </button>
    </section>
  );
}

function flashMessage(v: Visibility): string {
  if (v === "private") return "已切到 🔒 私人";
  if (v === "unlisted") return "已切到 🔗 非公開，已產生新連結";
  return "已切到 🌍 公開";
}

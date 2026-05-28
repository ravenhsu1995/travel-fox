"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Trip, Visibility } from "@/lib/types";

type TripSlice = Pick<Trip, "id" | "visibility" | "public_display_name">;

type Props = {
  trip: TripSlice;
  className?: string;
};

const ICON: Record<Visibility, { icon: string; label: string }> = {
  private: { icon: "🔒", label: "私人" },
  unlisted: { icon: "🔗", label: "非公開" },
  public: { icon: "🌍", label: "公開" },
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

export default function VisibilityBadgeButton({ trip, className }: Props) {
  const [open, setOpen] = useState(false);
  const current = ICON[trip.visibility];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`可見性：${current.label}（點擊更改）`}
        title={`${current.label}（點擊更改）`}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition hover:bg-card-pure ${className ?? ""}`}
      >
        {current.icon}
      </button>

      {/* Dialog is its own component, mounted only when open. Its local state
          inits from props on mount, so we don't need a useEffect-driven reset.
          Closing unmounts; next open is a fresh mount with current props. */}
      {open && <VisibilityDialog trip={trip} onClose={() => setOpen(false)} />}
    </>
  );
}

function VisibilityDialog({
  trip,
  onClose,
}: {
  trip: TripSlice;
  onClose: () => void;
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<Visibility>(trip.visibility);
  const [name, setName] = useState<string>(trip.public_display_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dirty =
    picked !== trip.visibility ||
    (picked === "public" &&
      (name.trim() || null) !== (trip.public_display_name ?? null));

  function onSave() {
    setError(null);
    startSave(async () => {
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
          setError(err);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[420px] space-y-3 rounded-t-2xl bg-card-pure p-4 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="可見性設定"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">可見性</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-muted hover:text-ink"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                picked === opt.value
                  ? "border-gold bg-gold/5"
                  : "border-line-2 hover:bg-card"
              }`}
            >
              <input
                type="radio"
                name={`visibility-${trip.id}`}
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
              className="mt-1 h-10 w-full rounded-lg border border-line-2 bg-card px-3 text-sm outline-none focus:border-gold"
            />
          </div>
        )}

        {/* Token rule: the share URL is a permanent per-trip identifier.
            Private state just blanks the contents on /s/[token]; switching
            back to non-private restores access on the same URL. */}
        {picked === "private" && trip.visibility !== "private" && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            切到私人後，現有連結會顯示「此行程目前為私人」；之後再次開放會自動恢復可看，連結不變。
          </p>
        )}

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-[11px] text-danger">
            {error}
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
      </div>
    </div>
  );
}

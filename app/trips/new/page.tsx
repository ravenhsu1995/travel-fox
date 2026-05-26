"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrip } from "./actions";

const EMOJIS = ["🤷", "🕺", "🦶", "🍿", "🎇", "🧌", "🗺️", "⛺", "🌠", "🌊", "🎢", "🤗", "❤️‍🔥"];

export default function NewTripPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("🤷");
  const [subtitleChips, setSubtitleChips] = useState<string[]>([]);
  const [subtitleDraft, setSubtitleDraft] = useState("");
  function addChip() {
    const v = subtitleDraft.trim();
    if (!v) return;
    setSubtitleChips([...subtitleChips, v]);
    setSubtitleDraft("");
  }
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("cover_emoji", emoji);
    const pending = subtitleDraft.trim();
    const allChips = pending ? [...subtitleChips, pending] : subtitleChips;
    formData.set("subtitle", allChips.join(" · "));

    startTransition(async () => {
      const result = await createTrip(formData);
      if (!result.ok) setError(result.error);
      else router.push("/trips");
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-4 pt-5 pb-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy">新增行程</h1>
        <Link
          href="/trips"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← 返回列表
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="封面 Emoji">
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${
                  e === emoji
                    ? "bg-gold text-white shadow-sm"
                    : "bg-card-pure hover:bg-card"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="行程標題" required>
          <input
            name="title"
            required
            placeholder="例：2026 關西行"
            className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
          />
        </Field>

        <Field label="城市／國家">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {subtitleChips.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-gold-pale px-2.5 py-0.5 text-xs font-semibold text-ink"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() =>
                      setSubtitleChips(subtitleChips.filter((_, j) => j !== i))
                    }
                    className="text-muted hover:text-danger"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChip();
                  }
                }}
                placeholder="輸入後按+"
                className="h-12 flex-1 rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={addChip}
                className="h-12 rounded-lg bg-card-pure px-4 text-sm font-semibold text-ink hover:bg-card"
              >
                +
              </button>
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="開始日期" required>
            <input
              name="start_date"
              type="date"
              required
              className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
            />
          </Field>
          <Field label="結束日期" required>
            <input
              name="end_date"
              type="date"
              required
              className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm outline-none focus:border-gold"
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-lg bg-gold text-sm font-semibold text-white shadow-md hover:bg-gold-lt disabled:opacity-50"
        >
          {pending ? "建立中…" : "建立行程"}
        </button>
        <p className="text-center text-xs text-muted">
          建立後會自動為日期區間每天產生一個空白日，之後可逐天編輯內容。
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-2">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

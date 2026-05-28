"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip } from "@/lib/types";

type Props = {
  trip: Pick<Trip, "id" | "visibility" | "share_token">;
};

export default function ShareButton({ trip }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // URL needs window.location.origin (client-only). Popover renders only
  // after click, so by that point we're guaranteed to be on the client.
  const url = open ? buildShareUrl(trip) : null;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const input = popoverRef.current?.querySelector("input");
      input?.select();
    }
  }

  // Single quiet style across surfaces — matches the action-bar items on the
  // /trips card (✏️ 編輯, 💴 記帳) and stays light enough not to fight the
  // plain "← back" link sitting next to it on the view page header.
  const buttonClass =
    "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-ink-2 hover:bg-card-pure";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonClass}
        aria-expanded={open}
      >
        🔗 分享
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-line-2 bg-card-pure p-3 shadow-lg"
          role="dialog"
        >
          <div className="text-xs font-semibold text-ink">
            {trip.visibility === "public"
              ? "🌍 公開行程連結"
              : "🔗 非公開分享連結"}
          </div>
          <p className="mt-0.5 text-[11px] text-muted">
            {trip.visibility === "public"
              ? "任何人可從範例行程列表進入"
              : "只有拿到這條連結的人能看到"}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <input
              readOnly
              value={url ?? ""}
              className="h-9 flex-1 truncate rounded-lg border border-line-2 bg-card px-2 text-[11px] text-ink-2 outline-none focus:border-gold"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={copy}
              disabled={!url}
              className="h-9 shrink-0 rounded-lg bg-gold px-3 text-xs font-semibold text-white hover:bg-gold-lt disabled:opacity-50"
            >
              {copied ? "已複製" : "複製"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function buildShareUrl(
  trip: Pick<Trip, "id" | "visibility" | "share_token">,
): string | null {
  const origin = window.location.origin;
  if (trip.visibility === "unlisted" && trip.share_token) {
    return `${origin}/s/${trip.share_token}`;
  }
  if (trip.visibility === "public") {
    return `${origin}/samples/${trip.id}`;
  }
  return null;
}

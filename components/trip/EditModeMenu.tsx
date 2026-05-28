"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PencilIcon, ClipboardIcon, StarIcon } from "@/components/icons";

type Props = {
  tripId: string;
};

export default function EditModeMenu({ tripId }: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-8 items-center gap-1 px-2.5 text-xs font-semibold transition ${
          open
            ? "bg-card-pure text-ink"
            : "rounded-lg text-ink-2 hover:bg-card-pure"
        }`}
        aria-expanded={open}
      >
        <PencilIcon />
        編輯
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 min-w-[200px] bg-card-pure shadow-md"
          role="menu"
        >
          <Link
            href={`/trips/${tripId}/edit`}
            className="flex items-start gap-2 px-2.5 py-2 text-ink-2 hover:bg-card"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <ClipboardIcon className="mt-0.5 h-4 w-4 text-success" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-ink">旅行前</div>
              <div className="mt-0.5 text-[11px] text-muted">建立或調整尚未出發的行程</div>
            </div>
          </Link>
          <Link
            href={`/trips/${tripId}/feedback`}
            className="flex items-start gap-2 px-2.5 py-2 text-ink-2 hover:bg-card"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <StarIcon className="mt-0.5 h-4 w-4 text-gold" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-ink">旅行後</div>
              <div className="mt-0.5 text-[11px] text-muted">評價進行中或已完成的行程</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

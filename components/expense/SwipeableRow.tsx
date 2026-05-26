"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type SwipeAction = {
  label: string;
  /** tailwind bg color class (e.g. "bg-warning") */
  bg: string;
  /** tailwind text color class (e.g. "text-white") */
  text?: string;
  onClick: () => void;
};

const ACTION_WIDTH = 88;

export default function SwipeableRow({
  actions,
  className = "",
  children,
}: {
  actions: SwipeAction[];
  className?: string;
  children: ReactNode;
}) {
  const totalReveal = ACTION_WIDTH * actions.length;
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startRef = useRef<{
    x: number;
    y: number;
    base: number;
    decided: "h" | "v" | null;
    pointerId: number;
  } | null>(null);

  const close = useCallback(() => setOffset(0), []);

  // Close on any outside tap so only one row is open at a time.
  useEffect(() => {
    if (offset === 0) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-swipe-row='open']")) close();
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [offset, close]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Ignore non-primary buttons (e.g. right click).
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      base: offset,
      decided: null,
      pointerId: e.pointerId,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = startRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;

    if (s.decided === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        s.decided = "h";
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        s.decided = "v";
        return;
      }
    }

    if (s.decided === "h") {
      const next = Math.min(0, Math.max(-totalReveal, s.base + dx));
      setOffset(next);
    }
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    if (s.decided === "h") {
      setDragging(false);
      const shouldOpen = -offset > totalReveal / 2;
      setOffset(shouldOpen ? -totalReveal : 0);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  }

  const isOpen = offset !== 0;

  return (
    <div
      data-swipe-row={isOpen ? "open" : "closed"}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 flex">
        {actions.map((a, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              a.onClick();
              close();
            }}
            className={`pointer-events-auto flex h-full items-center justify-center text-xs font-semibold ${a.bg} ${a.text ?? "text-white"}`}
            style={{ width: ACTION_WIDTH }}
            tabIndex={isOpen ? 0 : -1}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 180ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

// During an active drag we mutate the DOM transform directly via a ref to
// avoid re-rendering on every pointermove. React state is only used for the
// final open/closed snap so the parent can manage outside-click dismissal.
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
  const [open, setOpen] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const startRef = useRef<{
    x: number;
    y: number;
    base: number;
    decided: "h" | "v" | null;
    pointerId: number;
  } | null>(null);

  const setTransform = useCallback((px: number, animate: boolean) => {
    const el = slideRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 180ms ease-out" : "none";
    el.style.transform = `translate3d(${px}px, 0, 0)`;
    offsetRef.current = px;
  }, []);

  const snapTo = useCallback(
    (target: number) => {
      setTransform(target, true);
      setOpen(target !== 0);
    },
    [setTransform],
  );

  const close = useCallback(() => snapTo(0), [snapTo]);

  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-swipe-row='open']")) close();
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [open, close]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      base: offsetRef.current,
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
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        s.decided = "v";
        return;
      }
    }

    if (s.decided === "h") {
      const next = Math.min(0, Math.max(-totalReveal, s.base + dx));
      setTransform(next, false);
    }
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    if (s.decided === "h") {
      const shouldOpen = -offsetRef.current > totalReveal / 2;
      snapTo(shouldOpen ? -totalReveal : 0);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div
      data-swipe-row={open ? "open" : "closed"}
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
            tabIndex={open ? 0 : -1}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div
        ref={slideRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          transform: "translate3d(0,0,0)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

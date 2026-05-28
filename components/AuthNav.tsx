"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AuthState = {
  isAuthed: boolean;
  email: string | null;
};

export default function AuthNav() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>(() => ({
    isAuthed: pathname.startsWith("/trips"),
    email: null,
  }));

  useEffect(() => {
    let alive = true;

    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AuthState | null) => {
        if (!alive || !data) return;
        setAuth({
          isAuthed: data.isAuthed,
          email: data.email,
        });
      })
      .catch(() => {
        if (!alive) return;
        setAuth({ isAuthed: false, email: null });
      });

    return () => {
      alive = false;
    };
  }, []);

  if (auth.isAuthed) {
    return (
      <div className="flex shrink-0 items-center gap-2 text-xs min-[380px]:gap-3">
        <Link
          href="/trips"
          className="rounded-full bg-gold-pale px-3 py-1.5 font-semibold text-gold"
        >
          我的行程
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-full px-2 py-1.5 text-muted hover:text-ink"
            title={auth.email ?? undefined}
          >
            登出
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="shrink-0 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
    >
      登入
    </Link>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthed = !!data?.claims;
  const email = data?.claims?.email as string | undefined;

  return (
    <header className="sticky top-0 z-30 mx-auto flex h-14 w-full max-w-[480px] items-center justify-between border-b border-line bg-card/85 px-4 backdrop-blur">
      <Link href="/" className="text-sm font-extrabold text-navy">
        🦊 旅行狐狸
      </Link>
      {isAuthed ? (
        <div className="flex items-center gap-3 text-xs">
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
              title={email}
            >
              登出
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
        >
          登入
        </Link>
      )}
    </header>
  );
}

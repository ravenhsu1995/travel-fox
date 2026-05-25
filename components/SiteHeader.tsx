import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthed = !!data?.claims;
  const email = data?.claims?.email as string | undefined;

  return (
    <header
      className="relative z-30 mx-auto flex w-full max-w-[480px] items-center justify-between px-5 py-3"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <Link href="/" className="flex items-center" aria-label="旅行狐狸 首頁">
        <Image
          src="/logo.png"
          alt="旅行狐狸"
          width={1208}
          height={311}
          preload
          sizes="240px"
          className="h-12 w-auto"
        />
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

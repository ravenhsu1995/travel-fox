import Image from "next/image";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";

export default function SiteHeader() {
  return (
    <header
      className="relative z-30 mx-auto flex w-full max-w-[480px] items-center justify-between gap-3 px-5 py-3"
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
          className="h-10 w-auto min-[380px]:h-12"
        />
      </Link>
      <AuthNav />
    </header>
  );
}

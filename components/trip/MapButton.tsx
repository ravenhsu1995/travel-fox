export default function MapButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 Google 地圖開啟"
      title="在 Google 地圖開啟"
      className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-line-2 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="relative h-5 w-3.5 overflow-hidden rounded-t-full bg-[linear-gradient(135deg,#4285f4_0_34%,#34a853_34%_52%,#fbbc05_52%_72%,#ea4335_72%_100%)] shadow-xs [clip-path:polygon(50%_100%,0_42%,0_18%,18%_0,82%_0,100%_18%,100%_42%)]">
        <span className="absolute left-1/2 top-[34%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </span>
    </a>
  );
}

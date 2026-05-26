export default function MapButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 Google 地圖開啟"
      title="在 Google 地圖開啟"
      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="relative h-5 w-5 rotate-45 rounded-[50%_50%_50%_0] bg-[conic-gradient(from_15deg,#4285f4_0_28%,#34a853_28%_53%,#fbbc05_53%_74%,#ea4335_74%_100%)] shadow-xs">
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </span>
    </a>
  );
}

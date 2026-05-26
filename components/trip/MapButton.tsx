export default function MapButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="在 Google 地圖開啟"
      title="在 Google 地圖開啟"
      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-info/20 bg-info/10 text-base shadow-xs transition hover:-translate-y-0.5 hover:bg-info/15"
    >
      🗺️
    </a>
  );
}

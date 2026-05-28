// Shared action-icon set. All icons are Lucide-style stroke SVGs sized
// h-4 w-4 by default, fill=none, stroke=currentColor, strokeWidth=2 with
// round caps/joins — same visual language as the homepage CTA SVGs.
//
// Use the named exports throughout the app so future button changes can't
// drift back to mixed emoji + SVG.

type IconProps = {
  className?: string;
};

function Frame({
  className = "h-4 w-4",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </Frame>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Frame>
  );
}

export function WalletIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Frame>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Frame>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Frame>
  );
}

export function SaveIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </Frame>
  );
}

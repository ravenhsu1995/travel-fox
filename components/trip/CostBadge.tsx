export default function CostBadge({ value }: { value: string }) {
  return (
    <div className="mt-2 inline-flex max-w-full overflow-hidden rounded-md border border-gold/30 bg-gold-pale text-[11px] font-bold text-gold shadow-xs">
      <span className="flex-shrink-0 bg-gold px-1.5 py-1 text-white">
        費用
      </span>
      <span className="break-words px-2 py-1">{value}</span>
    </div>
  );
}

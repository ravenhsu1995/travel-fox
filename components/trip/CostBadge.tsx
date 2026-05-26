export default function CostBadge({ value }: { value: string }) {
  return (
    <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-gold bg-[#fff2b8] px-2.5 py-1 text-[11px] font-extrabold text-[#9a6500] shadow-xs">
      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold text-[10px] leading-none text-white">
        $
      </span>
      <span className="break-words">{value}</span>
    </div>
  );
}

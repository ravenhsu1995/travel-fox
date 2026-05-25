export default function RisksCard({ risks }: { risks: string[] }) {
  if (!risks || risks.length === 0) return null;
  return (
    <section className="rounded-xl border border-warning/30 bg-warning/5 p-4">
      <h3 className="mb-2 text-sm font-bold text-warning">⚠️ 注意事項</h3>
      <ul className="space-y-1.5 text-xs leading-relaxed text-ink-2">
        {risks.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span className="select-none text-warning">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { TICKER_ITEMS } from "@/lib/data";

export function LiveTicker({ items = TICKER_ITEMS }: { items?: string[] }) {
  const track = [...items, ...items];

  return (
    <div className="fade-up fade-up-delay-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="ticker-track gap-8 px-4 py-2.5 text-xs font-semibold tracking-wide text-[var(--muted)]">
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-[var(--faint)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

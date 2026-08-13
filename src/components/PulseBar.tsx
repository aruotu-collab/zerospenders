import { formatGBP } from "@/lib/data";
import type { PulseMetrics } from "@/lib/types";

export function PulseBar({ metrics }: { metrics: PulseMetrics }) {
  const items = [
    { label: "LIVE FREEBIES", value: metrics.liveFreebies.toLocaleString() },
    { label: "VALUE AVAILABLE", value: formatGBP(metrics.valueAvailable) },
    { label: "CLAIMS TODAY", value: metrics.claimsToday.toLocaleString() },
    { label: "NEW TODAY", value: metrics.newToday.toLocaleString() },
    { label: "ENDING SOON", value: metrics.endingSoon.toLocaleString() },
    { label: "VERIFIED", value: `${metrics.verifiedPct}%` },
  ];

  return (
    <section className="fade-up surface overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <span className="live-dot" />
          <div>
            <div className="font-display text-sm font-bold tracking-[0.18em] text-white">
              FREE PULSE
            </div>
            <div className="text-xs text-[var(--muted)]">
              {metrics.liveFreebies.toLocaleString()} live opportunities ·{" "}
              {formatGBP(metrics.valueAvailable)} estimated value ·{" "}
              {metrics.peopleWatching.toLocaleString()} people watching
            </div>
          </div>
        </div>
        <div className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--accent)]">
          VERY ACTIVE
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="bg-[var(--surface)] px-4 py-4">
            <div className="font-mono text-xl font-bold text-white md:text-2xl">{item.value}</div>
            <div className="mt-1 text-[10px] tracking-[0.16em] text-[var(--muted)]">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

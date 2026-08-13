import Link from "next/link";
import type { FreeSignal } from "@/lib/types";

export function NearYouRadar({ signals }: { signals: FreeSignal[] }) {
  const plotted = signals.slice(0, 6);

  return (
    <section className="surface relative overflow-hidden rounded-2xl p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">NEAR YOU</h2>
          <p className="text-xs text-[var(--muted)]">Radar of free signals around your location</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1 text-[11px] font-semibold">
          <Link href="/near-me" className="rounded-md bg-[var(--accent-dim)] px-2.5 py-1 text-[var(--accent)]">
            RADAR
          </Link>
          <Link href="/near-me?view=map" className="rounded-md px-2.5 py-1 text-[var(--muted)] hover:text-white">
            MAP
          </Link>
          <Link href="/near-me?view=feed" className="rounded-md px-2.5 py-1 text-[var(--muted)] hover:text-white">
            FEED
          </Link>
        </div>
      </div>

      <div className="relative mx-auto aspect-square max-w-[340px]">
        <div className="absolute inset-0 rounded-full border border-[var(--border)]" />
        <div className="absolute inset-[12%] rounded-full border border-[var(--border)]/80" />
        <div className="absolute inset-[28%] rounded-full border border-[var(--border)]/60" />
        <div className="absolute inset-[44%] rounded-full border border-[var(--accent)]/25 bg-[var(--radar)]/40" />
        <div className="radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,214,143,0.22)_40deg,transparent_70deg)] opacity-70" />
        <div className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)]" />

        {plotted.map((signal, i) => {
          const angle = (i / plotted.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 28 + ((signal.distanceMiles ?? 1) / 5) * 28;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          return (
            <Link
              key={signal.id}
              href={`/signals/${signal.id}`}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="relative flex flex-col items-center">
                <span className="ping-soft absolute h-3 w-3 rounded-full bg-[var(--accent)]" />
                <span className="relative rounded-full border border-[var(--accent)]/50 bg-[var(--bg-elevated)] px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
                  {signal.title.split("—")[0].trim().slice(0, 18)}
                  <span className="ml-1 text-[var(--accent)]">{signal.distanceMiles}mi</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

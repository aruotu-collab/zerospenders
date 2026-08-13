import { Suspense } from "react";
import { SignalCard } from "@/components/SignalCard";
import { PulseBar } from "@/components/PulseBar";
import { LiveTicker } from "@/components/LiveTicker";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ACTIVITY, PULSE, SIGNALS } from "@/lib/data";

export default function LivePage() {
  const sorted = [...SIGNALS].sort((a, b) => a.verifiedMinsAgo - b.verifiedMinsAgo);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--accent)]">
          <span className="live-dot" />
          LIVE FEED
        </div>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          Everything changing now
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          High-value FREE signals detected, ranked and verified in real time.
        </p>
      </div>

      <div className="mb-4">
        <PulseBar metrics={PULSE} />
      </div>
      <div className="mb-8">
        <LiveTicker />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {sorted.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
        <Suspense fallback={null}>
          <ActivityFeed items={ACTIVITY} />
        </Suspense>
      </div>
    </div>
  );
}

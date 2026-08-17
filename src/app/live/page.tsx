import { Suspense } from "react";
import { SignalCard } from "@/components/SignalCard";
import { PulseBar } from "@/components/PulseBar";
import { LiveTicker } from "@/components/LiveTicker";
import { ActivityFeed } from "@/components/ActivityFeed";
import { countryLabel } from "@/lib/countries";
import { getSelectedCountry } from "@/lib/country-server";
import { getPulse, listActivity, listSignals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LivePage() {
  const country = await getSelectedCountry();
  const [signals, pulse, activity] = await Promise.all([
    listSignals({ country }),
    getPulse(),
    listActivity(),
  ]);
  const sorted = [...signals].sort((a, b) => a.verifiedMinsAgo - b.verifiedMinsAgo);

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
          High-value FREE signals detected, ranked and verified in real time for{" "}
          {countryLabel(country)}.
        </p>
      </div>

      <div className="mb-4">
        <PulseBar metrics={pulse} />
      </div>
      <div className="mb-8">
        <LiveTicker />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="surface rounded-2xl p-10 text-center text-[var(--muted)]">
              No live signals for {countryLabel(country)} yet. Switch country above or check back soon.
            </div>
          ) : (
            sorted.map((signal) => <SignalCard key={signal.id} signal={signal} />)
          )}
        </div>
        <Suspense fallback={null}>
          <ActivityFeed items={activity} />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignalCard } from "@/components/SignalCard";
import { SIGNALS } from "@/lib/data";

const STORAGE_KEY = "zs-signal-actions";

export function DashboardActivity() {
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [watchingIds, setWatchingIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { claimed?: string[]; watching?: string[] };
        setClaimedIds(parsed.claimed ?? []);
        setWatchingIds(parsed.watching ?? []);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const claimed = SIGNALS.filter((s) => claimedIds.includes(s.id));
  const watching = SIGNALS.filter((s) => watchingIds.includes(s.id));

  if (!ready) return null;

  if (claimed.length === 0 && watching.length === 0) {
    return (
      <section className="surface mt-8 rounded-2xl p-5">
        <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
          YOUR CLAIMS & WATCHLIST
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Nothing saved yet. Open a signal and tap <strong className="text-white">Claim FREE</strong>{" "}
          or <strong className="text-white">Watch this signal</strong>.
        </p>
        <Link href="/live" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
          Browse live signals →
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 space-y-6">
      {claimed.length > 0 && (
        <div>
          <h2 className="font-display mb-3 text-sm font-bold tracking-[0.14em] text-[var(--accent)]">
            CLAIMED ({claimed.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {claimed.map((signal) => (
              <SignalCard key={signal.id} signal={signal} compact />
            ))}
          </div>
        </div>
      )}
      {watching.length > 0 && (
        <div>
          <h2 className="font-display mb-3 text-sm font-bold tracking-[0.14em] text-[var(--info)]">
            WATCHING ({watching.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {watching.map((signal) => (
              <SignalCard key={signal.id} signal={signal} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

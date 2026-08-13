"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignalCard } from "@/components/SignalCard";
import { NearYouRadar } from "@/components/NearYouRadar";
import { SIGNALS, nearYouSignals } from "@/lib/data";

export default function NearMeClient() {
  const searchParams = useSearchParams();
  const initial =
    searchParams.get("view") === "map"
      ? "map"
      : searchParams.get("view") === "feed"
        ? "feed"
        : "radar";
  const [view, setView] = useState<"radar" | "map" | "feed">(initial);
  const near = useMemo(() => nearYouSignals(), []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">FREE NEAR ME</p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">
            Signals around you
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            Demo location: SW1 · Radius 10 miles · {near.length} nearby opportunities
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1 text-xs font-semibold">
          {(["radar", "map", "feed"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 uppercase ${
                view === v
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "radar" && (
        <div className="mx-auto max-w-xl">
          <NearYouRadar signals={near} />
        </div>
      )}

      {view === "map" && (
        <div className="surface relative min-h-[480px] overflow-hidden rounded-2xl p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,214,143,0.12),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(61,184,255,0.1),transparent_30%),linear-gradient(180deg,#0c121a,#07090c)]" />
          <div className="relative z-10 grid h-full place-items-center">
            <div className="relative h-[380px] w-full max-w-3xl">
              {near.map((signal, i) => (
                <a
                  key={signal.id}
                  href={`/signals/${signal.id}`}
                  className="absolute rounded-lg border border-[var(--accent)]/40 bg-[var(--bg-elevated)]/90 px-3 py-2 text-xs shadow-lg backdrop-blur"
                  style={{
                    left: `${12 + ((i * 17) % 70)}%`,
                    top: `${18 + ((i * 23) % 55)}%`,
                  }}
                >
                  <div className="font-semibold text-white">{signal.title.slice(0, 28)}</div>
                  <div className="text-[var(--accent)]">
                    {signal.distanceMiles} mi · score {signal.freeScore}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "feed" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {near.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
          {SIGNALS.filter((s) => s.distanceMiles === undefined)
            .slice(0, 3)
            .map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ActivityFeed } from "@/components/ActivityFeed";
import { HeatMap } from "@/components/HeatMap";
import { LiveTicker } from "@/components/LiveTicker";
import { NearYouRadar } from "@/components/NearYouRadar";
import { PulseBar } from "@/components/PulseBar";
import { SignalCard } from "@/components/SignalCard";
import { formatGBP } from "@/lib/data";
import { getSelectedCountry } from "@/lib/country-server";
import { getBoardBundles } from "@/lib/queries";
import type { FreeSignal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const country = await getSelectedCountry();
  const { trending, dropped, ending, near, pulse, activity, drops, cityHeat, ticker } =
    await getBoardBundles(country);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
      <section className="fade-up mb-6 grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-dim)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent)]">
            <span className="live-dot" />
            LIVE INTELLIGENCE BOARD
          </div>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl">
            ZeroSpenders
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--muted)] md:text-xl">
            Before you pay, check FREE. We scan, rank and verify £0 opportunities in real time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f] transition hover:brightness-110"
            >
              Join free — start hunting
            </Link>
            <Link
              href="/near-me"
              className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--accent)]/40"
            >
              Free near me
            </Link>
          </div>
        </div>
        <div className="surface rounded-2xl p-5">
          <p className="text-xs tracking-[0.16em] text-[var(--muted)]">SEARCH THE FREE ENGINE</p>
          <form action="/live" className="mt-3 flex gap-2">
            <input
              name="q"
              placeholder="What can I get free near me today?"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]/50"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-white px-4 py-3 text-sm font-bold text-black"
            >
              Scan
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--muted)]">
            {["Birthday freebies", "No card trials", "Kids this weekend", "Free coffee"].map((chip) => (
              <Link
                key={chip}
                href="/live"
                className="rounded-full border border-[var(--border)] px-2.5 py-1 hover:border-[var(--accent)]/40 hover:text-white"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-4">
        <PulseBar metrics={pulse} />
      </div>
      <div className="mb-8">
        <LiveTicker items={ticker} />
      </div>

      <section className="fade-up fade-up-delay-2 mb-8 grid gap-4 lg:grid-cols-3">
        <Column title="TRENDING NOW" accent="text-[var(--alert)]" signals={trending} />
        <Column title="JUST DROPPED" accent="text-[var(--warn)]" signals={dropped} />
        <Column title="ENDING SOON" accent="text-[var(--info)]" signals={ending} />
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <NearYouRadar signals={near} />
        <ActivityFeed items={activity} />
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <HeatMap cities={cityHeat} />
        <div className="surface rounded-2xl p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
                CREATOR DROPS
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Brands shipping free product for genuine content — nano creators welcome
              </p>
            </div>
            <Link href="/creators" className="text-xs font-semibold text-[var(--accent)]">
              Open board →
            </Link>
          </div>
          <div className="space-y-3">
            {drops.map((drop) => (
              <Link
                key={drop.id}
                href="/creators"
                className="block rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-wide text-[var(--warn)]">
                      {drop.missionType}
                    </div>
                    <h3 className="mt-1 font-display font-semibold text-white">{drop.title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {drop.brand} · Retail {formatGBP(drop.retailValue)} · {drop.applied} applied ·{" "}
                      {drop.available - drop.selected} places left
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-[var(--accent)]">
                      {drop.matchScore}%
                    </div>
                    <div className="text-[10px] tracking-wide text-[var(--faint)]">MATCH</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="surface mb-4 overflow-hidden rounded-2xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--accent)]">
              THREE NETWORKS. ONE FREE ENGINE.
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-white md:text-4xl">
              Members find free. Creators get product. Brands get reach.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--muted)]">
              ZeroSpenders connects people who want £0 opportunities with creators who make content
              and brands who need genuine product experiences.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {[
              { href: "/join", label: "Members", text: "Hunt freebies, save favourites, earn hunter levels." },
              { href: "/creators", label: "Creators", text: "Apply to drops. Keep the product. Share genuine takes." },
              { href: "/brands", label: "Brands", text: "Launch creator drops and exclusive freebie campaigns." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--accent)]/40"
              >
                <div className="font-display font-semibold text-white">{item.label}</div>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Column({
  title,
  accent,
  signals,
}: {
  title: string;
  accent: string;
  signals: FreeSignal[];
}) {
  return (
    <div className="space-y-3">
      <h2 className={`font-display text-sm font-bold tracking-[0.14em] ${accent}`}>{title}</h2>
      <div className="space-y-3">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} compact />
        ))}
      </div>
    </div>
  );
}

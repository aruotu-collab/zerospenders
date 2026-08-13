import Link from "next/link";
import { SignalCard } from "@/components/SignalCard";
import { formatGBP, SIGNALS, nearYouSignals } from "@/lib/data";

export default function DashboardPage() {
  const matches = nearYouSignals().slice(0, 3);
  const ending = SIGNALS.filter((s) => s.status === "ending").slice(0, 2);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">
            MEMBER INTELLIGENCE
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white">Good evening, James</h1>
          <p className="mt-2 text-[var(--muted)]">
            We found 47 FREE opportunities for you. 9 are new since your last visit. 3 are unusually
            good. 2 are about to disappear.
          </p>
        </div>
        <div className="surface rounded-2xl px-5 py-4 text-right">
          <div className="text-[10px] tracking-[0.14em] text-[var(--faint)]">YOU&apos;VE SAVED</div>
          <div className="font-mono text-3xl font-bold text-[var(--accent)]">{formatGBP(684.2)}</div>
          <div className="text-xs text-[var(--muted)]">
            This month {formatGBP(87.4)} · Top 8% of Freebie Hunters
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Level", "Freebie Hunter"],
          ["Watchlists", "6 active"],
          ["Radius", "10 miles · SW1"],
          ["Alerts", "Instant on"],
        ].map(([k, v]) => (
          <div key={k} className="surface rounded-xl px-4 py-3">
            <div className="text-[10px] tracking-[0.14em] text-[var(--faint)]">{k.toUpperCase()}</div>
            <div className="mt-1 font-semibold text-white">{v}</div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-[var(--accent)]">
            🎯 TOP MATCH FOR YOU — 97%
          </h2>
          <Link href="/near-me" className="text-xs text-[var(--muted)] hover:text-white">
            Adjust preferences
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {matches.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="surface rounded-2xl p-5">
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
            WATCH FREE
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Tell me when…</p>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {[
              "Nike has a genuine free promotion",
              "A free attraction appears within 5 miles",
              "Free children's activities appear this weekend",
              "A free trial doesn't require a credit card",
              "Something worth £50+ becomes free",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 border-b border-[var(--border)] pb-3 last:border-0">
                <span className="text-[var(--accent)]">●</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-white">
            Add watch rule
          </button>
        </div>

        <div>
          <h2 className="font-display mb-4 text-sm font-bold tracking-[0.14em] text-[var(--alert)]">
            ABOUT TO DISAPPEAR
          </h2>
          <div className="space-y-3">
            {ending.map((signal) => (
              <SignalCard key={signal.id} signal={signal} compact />
            ))}
          </div>
          <div className="surface mt-4 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white">Want even more FREE stuff?</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Become a FREE Creator. Try products from brands and share your genuine experience.
            </p>
            <Link
              href="/creators"
              className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]"
            >
              Open creator board →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

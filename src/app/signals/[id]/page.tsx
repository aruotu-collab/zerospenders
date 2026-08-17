import Link from "next/link";
import { notFound } from "next/navigation";
import { FreeScoreBadge } from "@/components/FreeScoreBadge";
import { SignalActions } from "@/components/SignalActions";
import { formatGBP, scoreLabel } from "@/lib/data";
import { getSignalBySlug, listSignals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const signals = await listSignals();
    return signals.map((s) => ({ id: s.id }));
  } catch {
    return [];
  }
}

export default async function SignalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signal = await getSignalBySlug(id);
  if (!signal) notFound();

  const label = scoreLabel(signal.freeScore);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      <Link href="/" className="text-sm text-[var(--muted)] hover:text-white">
        ← Back to intelligence board
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="surface rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide">
                <span className="text-[var(--accent)]">
                  {signal.status === "new"
                    ? "JUST DROPPED"
                    : signal.status === "ending"
                      ? "ENDING FAST"
                      : "LIVE SIGNAL"}
                </span>
                <span className="text-[var(--faint)]">·</span>
                <span className="uppercase text-[var(--muted)]">{signal.category} free</span>
                {signal.sponsored && (
                  <span className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[var(--muted)]">
                    SPONSORED FREEBIE
                  </span>
                )}
              </div>
              <h1 className="font-display mt-3 text-3xl font-bold text-white md:text-5xl">
                {signal.title}
              </h1>
              <p className="mt-3 max-w-2xl text-[var(--muted)]">{signal.summary}</p>
            </div>
            <FreeScoreBadge score={signal.freeScore} size="lg" showLabel />
          </div>

          <div className="mt-2 text-sm font-semibold tracking-wide text-[var(--accent)]">
            {label}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["STATUS", signal.status === "live" ? "🟢 LIVE" : signal.status === "ending" ? "🟠 ENDING" : "⚡ NEW"],
              ["NORMAL VALUE", formatGBP(signal.normalValue)],
              ["YOUR COST", "£0"],
              ["CLAIMS", signal.claims.toLocaleString()],
              ["WATCHING", signal.watching.toLocaleString()],
              ["SUCCESS RATE", `${signal.successRate}%`],
              ["LAST VERIFIED", `${signal.verifiedMinsAgo} mins ago`],
              ["REQUIRES CARD", signal.requiresCard ? "Yes" : "No"],
              ["CANCEL REMINDER", signal.cancelReminder ? "Available" : "N/A"],
              ["LOCATION", signal.distanceMiles ? `${signal.location} · ${signal.distanceMiles} mi` : signal.location],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
                <div className="text-[10px] tracking-[0.14em] text-[var(--faint)]">{k}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-white">{v}</div>
              </div>
            ))}
          </div>

          <SignalActions
            signalId={signal.id}
            title={signal.title}
            normalValue={signal.normalValue}
            cancelReminder={signal.cancelReminder}
          />

          {signal.claimUrl && (
            <a
              href={signal.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg border border-[var(--info)]/40 bg-[rgba(61,184,255,0.1)] px-5 py-3 text-sm font-bold text-[var(--info)] transition hover:brightness-110"
            >
              Open official claim page →
            </a>
          )}
        </section>

        <aside className="space-y-4">
          <section className="surface rounded-2xl p-5">
            <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
              COMMUNITY INTELLIGENCE
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-dim)] px-3 py-3 text-sm">
                <span>✓ Worked for me</span>
                <span className="font-mono font-bold text-[var(--accent)]">
                  {signal.workedFor.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--alert)]/20 bg-[rgba(255,90,60,0.08)] px-3 py-3 text-sm">
                <span>✕ Didn&apos;t work</span>
                <span className="font-mono font-bold text-[var(--alert)]">
                  {signal.didntWork.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section className="surface rounded-2xl p-5">
            <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
              LIVE UPDATES
            </h2>
            <ul className="mt-4 space-y-3">
              {signal.updates.map((u) => (
                <li key={`${u.time}-${u.text}`} className="border-b border-[var(--border)] pb-3 text-sm last:border-0">
                  <div className="font-mono text-[11px] text-[var(--faint)]">{u.time}</div>
                  <div className="mt-1 text-[var(--text)]">{u.text}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface rounded-2xl p-5">
            <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
              FREE SCORE BREAKDOWN
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>Value — normally {formatGBP(signal.normalValue)}</li>
              <li>Popularity — {signal.claims} claims</li>
              <li>Scarcity — {signal.remaining !== undefined ? `${signal.remaining} remaining` : "open availability"}</li>
              <li>Verification — confirmed {signal.verifiedMinsAgo} mins ago</li>
              <li>Community — {signal.successRate}% success</li>
              <li>Friction — {signal.requiresCard ? "card required" : "no card / instant"}</li>
              {signal.distanceMiles !== undefined && <li>Distance — {signal.distanceMiles} miles</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

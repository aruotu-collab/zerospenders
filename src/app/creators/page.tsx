import Link from "next/link";
import { CREATOR_DROPS, formatGBP } from "@/lib/data";

export default function CreatorsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--warn)]">FREE CREATOR</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-6xl">
          Get products. Create content. Grow your influence.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Nano creators, micro creators and UGC makers welcome. You don&apos;t need 100k followers —
          brands often want genuine people who can make good content.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/join"
            className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]"
          >
            Become a creator
          </Link>
          <Link
            href="/brands"
            className="rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold text-white"
          >
            I&apos;m a brand
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Nano", "500–5k"],
          ["Micro", "5k–25k"],
          ["Creator", "25k–100k"],
          ["Influencer", "100k+"],
          ["UGC", "No follower min"],
        ].map(([label, range]) => (
          <div key={label} className="surface rounded-xl px-4 py-3">
            <div className="font-display font-semibold text-white">{label}</div>
            <div className="text-xs text-[var(--muted)]">{range}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display mb-4 text-sm font-bold tracking-[0.14em] text-white">
        LIVE CREATOR DROPS
      </h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {CREATOR_DROPS.map((drop) => (
          <article key={drop.id} className="surface rounded-2xl p-5">
            <div className="text-[11px] font-semibold tracking-wide text-[var(--warn)]">
              🔥 {drop.missionType}
            </div>
            <h3 className="font-display mt-2 text-xl font-bold text-white">{drop.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {drop.brand} · Retail value {formatGBP(drop.retailValue)}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                <div className="font-mono text-base font-bold text-white">{drop.available}</div>
                <div className="text-[var(--faint)]">available</div>
              </div>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                <div className="font-mono text-base font-bold text-white">{drop.applied}</div>
                <div className="text-[var(--faint)]">applied</div>
              </div>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-2">
                <div className="font-mono text-base font-bold text-[var(--accent)]">{drop.matchScore}%</div>
                <div className="text-[var(--faint)]">match</div>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-[var(--muted)]">
              {drop.requirements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--alert)]">
              Applications close in {drop.closesInHours}h · {drop.available - drop.selected} places left
            </p>
            <button className="mt-4 w-full rounded-lg bg-white py-2.5 text-sm font-bold text-black">
              Apply for free product
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--faint)]">
              Genuine experiences only. Disclosure required. Not paid for positive reviews.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

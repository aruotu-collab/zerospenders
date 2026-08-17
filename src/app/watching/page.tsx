import Link from "next/link";
import { auth } from "@/auth";
import { BoardSignalItem } from "@/components/BoardSignalItem";
import { getDashboardData } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function WatchingBoardPage() {
  const session = await auth();
  const data = await getDashboardData();

  if (!session?.user || !data) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center md:px-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--info)]">WATCH BOARD</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white">Your watchlist</h1>
        <p className="mt-3 text-[var(--muted)]">
          Sign in to see every FREE signal you&apos;re watching — and pass great finds to friends.
        </p>
        <Link
          href="/join"
          className="mt-6 inline-flex rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]"
        >
          Join free
        </Link>
      </div>
    );
  }

  const { watching, claimed, user } = data;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--info)]">
            <span className="live-dot" />
            WATCH BOARD
          </div>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Watching
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            {watching.length === 0
              ? `${user.name?.split(" ")[0] ?? "Hunter"}, you’re not watching anything yet. Open a signal and tap Watch.`
              : `${watching.length} signal${watching.length === 1 ? "" : "s"} on your board — share any with a friend before they end.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/claimed"
            className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-white"
          >
            Claimed ({claimed.length})
          </Link>
          <Link
            href="/live"
            className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
          >
            Find more →
          </Link>
        </div>
      </div>

      {watching.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <p className="text-[var(--muted)]">Your watch board is empty.</p>
          <Link
            href="/live"
            className="mt-4 inline-flex rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]"
          >
            Browse live signals
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watching.map((signal) => (
            <BoardSignalItem
              key={signal.id}
              signal={signal}
              badge="● WATCHING"
              badgeClassName="border-[var(--info)]/40 bg-[rgba(61,184,255,0.12)] text-[var(--info)]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

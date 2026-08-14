import Link from "next/link";
import { auth } from "@/auth";
import { SignalCard } from "@/components/SignalCard";
import { getDashboardData } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ClaimedBoardPage() {
  const session = await auth();
  const data = await getDashboardData();

  if (!session?.user || !data) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center md:px-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">CLAIMED BOARD</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white">Your claims</h1>
        <p className="mt-3 text-[var(--muted)]">
          Sign in to track every FREE opportunity you&apos;ve claimed.
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

  const { claimed, watching, user } = data;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">CLAIMED BOARD</p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">Claimed</h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            {claimed.length === 0
              ? `${user.name?.split(" ")[0] ?? "Hunter"}, no claims yet.`
              : `${claimed.length} FREE claim${claimed.length === 1 ? "" : "s"} saved to your board.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/watching"
            className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-white"
          >
            Watching ({watching.length})
          </Link>
          <Link
            href="/live"
            className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
          >
            Find more →
          </Link>
        </div>
      </div>

      {claimed.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center">
          <p className="text-[var(--muted)]">Your claimed board is empty.</p>
          <Link
            href="/live"
            className="mt-4 inline-flex rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]"
          >
            Browse live signals
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {claimed.map((signal) => (
            <div key={signal.id} className="relative">
              <div className="absolute right-3 top-3 z-10 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent)]">
                ✓ CLAIMED
              </div>
              <SignalCard signal={signal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

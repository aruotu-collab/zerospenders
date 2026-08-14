import Link from "next/link";
import { SignalCard } from "@/components/SignalCard";
import { formatGBP } from "@/lib/data";
import { getDashboardData } from "@/lib/actions";
import { listSignals } from "@/lib/queries";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData();
  const near = (await listSignals({ nearOnly: true })).slice(0, 3);
  const ending = (await listSignals()).filter((s) => s.status === "ending").slice(0, 2);

  if (!session?.user || !data) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-4xl font-bold text-white">Your intelligence board</h1>
        <p className="mt-3 text-[var(--muted)]">
          Sign in to sync claims, watches and savings across devices.
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

  const { user, claimed, watching } = data;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">
            MEMBER INTELLIGENCE
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white">
            {greeting}, {user.name?.split(" ")[0] ?? "hunter"}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {claimed.length} claimed · {watching.length} watching · interests:{" "}
            {user.interests.slice(0, 4).join(", ") || "everything"}
          </p>
        </div>
        <div className="surface rounded-2xl px-5 py-4 text-right">
          <div className="text-[10px] tracking-[0.14em] text-[var(--faint)]">YOU&apos;VE SAVED</div>
          <div className="font-mono text-3xl font-bold text-[var(--accent)]">
            {formatGBP(user.savedGBP)}
          </div>
          <div className="text-xs text-[var(--muted)]">{user.hunterLevel}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Level", user.hunterLevel],
          ["Watchlists", `${watching.length} active`],
          ["Radius", `${user.radiusMiles} miles · ${user.postcode ?? "UK"}`],
          ["Role", user.role],
        ].map(([k, v]) => (
          <div key={k} className="surface rounded-xl px-4 py-3">
            <div className="text-[10px] tracking-[0.14em] text-[var(--faint)]">{k.toUpperCase()}</div>
            <div className="mt-1 font-semibold text-white">{v}</div>
          </div>
        ))}
      </div>

      {(claimed.length > 0 || watching.length > 0) && (
        <section className="mt-8 space-y-6">
          {watching.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold tracking-[0.14em] text-[var(--info)]">
                  WATCHING ({watching.length})
                </h2>
                <Link href="/watching" className="text-xs font-semibold text-[var(--info)]">
                  Open watch board →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {watching.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} compact />
                ))}
              </div>
            </div>
          )}
          {claimed.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold tracking-[0.14em] text-[var(--accent)]">
                  CLAIMED ({claimed.length})
                </h2>
                <Link href="/claimed" className="text-xs font-semibold text-[var(--accent)]">
                  Open claimed board →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {claimed.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} compact />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold tracking-[0.14em] text-[var(--accent)]">
            TOP MATCHES NEAR YOU
          </h2>
          <Link href="/near-me" className="text-xs text-[var(--muted)] hover:text-white">
            Open radar
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {near.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display mb-4 text-sm font-bold tracking-[0.14em] text-[var(--alert)]">
          ABOUT TO DISAPPEAR
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {ending.map((signal) => (
            <SignalCard key={signal.id} signal={signal} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

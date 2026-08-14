import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[rgba(5,7,10,0.9)]">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="font-display text-xl font-bold text-white">ZeroSpenders</div>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Before you pay, check FREE. We scan, rank and verify £0 opportunities so you never miss
            what you could get for nothing.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-[var(--faint)]">EXPLORE</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/live" className="hover:text-white">Live board</Link></li>
            <li><Link href="/watching" className="hover:text-white">Watching</Link></li>
            <li><Link href="/claimed" className="hover:text-white">Claimed</Link></li>
            <li><Link href="/near-me" className="hover:text-white">Near me</Link></li>
            <li><Link href="/today" className="hover:text-white">Free today</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-[var(--faint)]">NETWORKS</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li><Link href="/join" className="hover:text-white">Members</Link></li>
            <li><Link href="/creators" className="hover:text-white">Creators</Link></li>
            <li><Link href="/brands" className="hover:text-white">Brands</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-[var(--faint)]">PROMISE</div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Free core forever. Sponsored placements are labelled. Community signals stay transparent.
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-xs text-[var(--faint)] md:px-6">
        © {new Date().getFullYear()} zerospenders.com — Intelligence for £0 opportunities
      </div>
    </footer>
  );
}

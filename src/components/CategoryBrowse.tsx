import Link from "next/link";
import { LoadMore } from "./LoadMore";
import { SignalCard } from "./SignalCard";
import type { FreeSignal } from "@/lib/types";

export function CategoryBrowse({
  title,
  blurb,
  signals,
  countryName,
  total,
  page,
  basePath,
}: {
  title: string;
  blurb: string;
  signals: FreeSignal[];
  countryName?: string;
  total?: number;
  page?: number;
  basePath?: string;
}) {
  const count = total ?? signals.length;
  const showPager = Boolean(basePath && page && count > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">CATEGORY</p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">{blurb}</p>
          {countryName && (
            <p className="mt-2 text-xs font-semibold tracking-wide text-[var(--info)]">
              Showing {signals.length.toLocaleString()} of {count.toLocaleString()} signals for{" "}
              {countryName}
            </p>
          )}
        </div>
        <Link
          href="/live"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
        >
          <span className="live-dot" />
          View live feed
        </Link>
      </div>

      {signals.length === 0 ? (
        <div className="surface rounded-2xl p-10 text-center text-[var(--muted)]">
          {countryName
            ? `No live signals for ${countryName} in this category yet. Switch country above or check back soon.`
            : "No live signals in this category yet. Check back soon."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
          {showPager && (
            <LoadMore
              shown={signals.length}
              total={count}
              page={page!}
              basePath={basePath!}
              label={countryName ? `in ${countryName}` : undefined}
            />
          )}
        </>
      )}
    </div>
  );
}

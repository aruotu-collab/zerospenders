import Link from "next/link";
import { PAGE_SIZE, MAX_PAGES, pageHref } from "@/lib/pagination";

export function LoadMore({
  shown,
  total,
  page,
  basePath,
  label,
}: {
  shown: number;
  total: number;
  page: number;
  basePath: string;
  label?: string;
}) {
  if (total <= 0) return null;

  const remaining = Math.max(0, total - shown);
  const canLoadMore = remaining > 0 && page < MAX_PAGES;
  const nextCount = Math.min(PAGE_SIZE, remaining);

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-sm text-[var(--muted)]">
        Showing {shown.toLocaleString()} of {total.toLocaleString()}
        {label ? ` ${label}` : ""}
      </p>
      {canLoadMore ? (
        <Link
          href={pageHref(basePath, page + 1)}
          scroll={false}
          className="inline-flex items-center rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-5 py-2.5 text-sm font-semibold text-[var(--accent)] hover:border-[var(--accent)]/60"
        >
          Load {nextCount} more
        </Link>
      ) : remaining > 0 ? (
        <p className="text-xs text-[var(--faint)]">
          First {shown.toLocaleString()} ranked by FREE SCORE. Narrow by country above to see a tighter set.
        </p>
      ) : null}
    </div>
  );
}

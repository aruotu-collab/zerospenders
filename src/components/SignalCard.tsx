"use client";

import Link from "next/link";
import type { FreeSignal } from "@/lib/types";
import { formatGBP, scoreLabel } from "@/lib/data";
import { FreeScoreBadge } from "./FreeScoreBadge";
import { trackClick } from "./AnalyticsTracker";

const statusMeta = {
  live: { label: "LIVE", className: "text-[var(--accent)]" },
  ending: { label: "ENDING FAST", className: "text-[var(--alert)]" },
  new: { label: "JUST DROPPED", className: "text-[var(--warn)]" },
};

const verificationMeta = {
  verified: { label: "VERIFIED", className: "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent-dim)]" },
  community: { label: "COMMUNITY", className: "text-[var(--warn)] border-[var(--warn)]/30 bg-[rgba(255,176,32,0.1)]" },
  exclusive: { label: "EXCLUSIVE", className: "text-[var(--exclusive)] border-[var(--exclusive)]/30 bg-[rgba(91,140,255,0.1)]" },
};

export function SignalCard({
  signal,
  compact = false,
}: {
  signal: FreeSignal;
  compact?: boolean;
}) {
  const status = statusMeta[signal.status];
  const verification = verificationMeta[signal.verification];
  const label = scoreLabel(signal.freeScore);
  const href = `/signals/${signal.id}`;

  return (
    <Link
      href={href}
      onClick={() =>
        trackClick({
          targetType: "signal",
          targetId: signal.id,
          targetLabel: signal.title,
          href,
        })
      }
      className="group block surface rounded-xl p-4 transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide">
            <span className={status.className}>{status.label}</span>
            {signal.droppedMinsAgo !== undefined && (
              <span className="text-[var(--muted)]">{signal.droppedMinsAgo} mins ago</span>
            )}
            {signal.endsInHours !== undefined && (
              <span className="font-mono text-[var(--alert)]">
                Ends in {signal.endsInHours < 2 ? `${Math.round(signal.endsInHours * 60)}m` : `${signal.endsInHours.toFixed(1)}h`}
              </span>
            )}
            {signal.sponsored && (
              <span className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[var(--muted)]">
                SPONSORED
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-semibold leading-snug text-[var(--text)] group-hover:text-white">
            {signal.title}
          </h3>
          {!compact && (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{signal.summary}</p>
          )}
        </div>
        <FreeScoreBadge score={signal.freeScore} size="sm" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
        <span className="font-mono text-[var(--accent)]">{formatGBP(signal.normalValue)} → £0</span>
        {signal.distanceMiles !== undefined && <span>{signal.distanceMiles} mi · {signal.location}</span>}
        {signal.distanceMiles === undefined && <span>{signal.location}</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className={`rounded border px-1.5 py-0.5 ${verification.className}`}>
          {verification.label}
        </span>
        <span className="text-[var(--faint)]">{label}</span>
        <span className="ml-auto font-semibold text-[var(--accent)]">
          How to get this →
        </span>
      </div>

      {signal.remaining !== undefined && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-[var(--muted)]">
            <span>{signal.remaining} remaining</span>
            {signal.activityDelta !== undefined && (
              <span className="text-[var(--accent)]">↑ {signal.activityDelta}% activity</span>
            )}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${Math.min(100, Math.max(8, 100 - signal.remaining))}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  );
}

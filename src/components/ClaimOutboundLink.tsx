"use client";

import { trackClick } from "@/components/AnalyticsTracker";

export function ClaimOutboundLink({
  href,
  signalId,
  title,
}: {
  href: string;
  signalId: string;
  title: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackClick({
          targetType: "claim_url",
          targetId: signalId,
          targetLabel: title,
          href,
        })
      }
      className="mt-4 inline-flex rounded-lg border border-[var(--info)]/40 bg-[rgba(61,184,255,0.1)] px-5 py-3 text-sm font-bold text-[var(--info)] transition hover:brightness-110"
    >
      Open official claim page →
    </a>
  );
}

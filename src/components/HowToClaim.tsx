"use client";

import { trackClick } from "@/components/AnalyticsTracker";

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function HowToClaim({
  signalId,
  title,
  claimUrl,
  claimPhone,
  claimEmail,
  howToClaim,
  location,
}: {
  signalId: string;
  title: string;
  claimUrl?: string;
  claimPhone?: string;
  claimEmail?: string;
  howToClaim?: string;
  location?: string;
}) {
  const hasContact = Boolean(claimUrl || claimPhone || claimEmail);
  const steps =
    howToClaim?.trim() ||
    (claimUrl
      ? "1. Open the official page below.\n2. Follow their free entry / signup / rewards steps.\n3. Bring confirmation (email, app, or code) if the venue asks for it."
      : claimPhone || claimEmail
        ? "1. Contact them using the phone or email below.\n2. Ask about the free offer and any booking rules.\n3. Confirm opening times / stock before you travel."
        : "We don’t have an official claim link for this find yet. Check the location details, ask at the venue, or submit an update if you discover how to claim it.");

  return (
    <section
      id="how-to-claim"
      className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--accent)]/35 bg-[var(--accent-dim)] p-5 md:p-6"
    >
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--accent)]">
        HOW TO GET THIS FREE
      </p>
      <h2 className="font-display mt-1 text-xl font-bold text-white md:text-2xl">
        Where &amp; how to claim
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        This is the real path to the deal — website, phone, or email — so you can verify it exists
        before you go.
      </p>

      {location && (
        <p className="mt-3 text-sm text-[var(--text)]">
          <span className="text-[var(--faint)]">Location · </span>
          {location}
        </p>
      )}

      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--text)]">
        {steps.split(/\n+/).map((line) => {
          const cleaned = line.replace(/^\d+\.\s*/, "").trim();
          if (!cleaned) return null;
          return <li key={cleaned}>{cleaned}</li>;
        })}
      </ol>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {claimUrl && (
          <a
            href={claimUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackClick({
                targetType: "claim_url",
                targetId: signalId,
                targetLabel: title,
                href: claimUrl,
              })
            }
            className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3.5 text-sm font-bold text-[#04140f] transition hover:brightness-110"
          >
            Open official page →
            <span className="ml-2 font-mono text-[11px] font-semibold opacity-70">
              {hostLabel(claimUrl)}
            </span>
          </a>
        )}

        {claimPhone && (
          <a
            href={`tel:${claimPhone.replace(/\s+/g, "")}`}
            onClick={() =>
              trackClick({
                targetType: "claim_phone",
                targetId: signalId,
                targetLabel: title,
                href: `tel:${claimPhone}`,
              })
            }
            className="inline-flex items-center justify-center rounded-lg border border-[var(--info)]/40 bg-[rgba(61,184,255,0.1)] px-5 py-3.5 text-sm font-bold text-[var(--info)] transition hover:brightness-110"
          >
            Call {claimPhone}
          </a>
        )}

        {claimEmail && (
          <a
            href={`mailto:${claimEmail}?subject=${encodeURIComponent(`Free offer: ${title}`)}`}
            onClick={() =>
              trackClick({
                targetType: "claim_email",
                targetId: signalId,
                targetLabel: title,
                href: `mailto:${claimEmail}`,
              })
            }
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border-strong)] px-5 py-3.5 text-sm font-bold text-white transition hover:border-[var(--accent)]/40"
          >
            Email {claimEmail}
          </a>
        )}
      </div>

      {!hasContact && (
        <p className="mt-4 text-sm text-[var(--warn)]">
          No official website, phone or email on file yet. Treat this as a lead and confirm before
          travelling.
        </p>
      )}
    </section>
  );
}

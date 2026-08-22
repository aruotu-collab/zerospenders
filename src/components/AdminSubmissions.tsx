"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  approveOfferSubmission,
  rejectOfferSubmission,
} from "@/lib/actions";

type SubmissionRow = {
  id: string;
  title: string;
  summary: string;
  category: string;
  country: string;
  city: string;
  claimUrl: string | null;
  claimPhone: string | null;
  claimEmail: string | null;
  howToClaim: string | null;
  normalValue: number;
  createdAt: string | Date;
  hunter: string;
};

export function AdminSubmissions({ submissions }: { submissions: SubmissionRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function review(id: string, action: "approve" | "reject") {
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveOfferSubmission(id)
          : await rejectOfferSubmission(id);
      if (!result.ok) {
        setMessage("Could not update submission.");
        return;
      }
      setMessage(
        action === "approve"
          ? `Approved${"slug" in result && result.slug ? ` → /signals/${result.slug}` : ""}`
          : "Rejected."
      );
      router.refresh();
    });
  }

  return (
    <section className="surface mb-8 rounded-xl p-5">
      <h2 className="font-display text-lg font-semibold text-white">
        Pending FREE finds ({submissions.length})
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Approve to publish live with website / phone / email claim path. Reject to dismiss.
      </p>
      {message && (
        <p className="mt-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-sm text-[var(--accent)]">
          {message}
        </p>
      )}
      <div className="mt-4 space-y-4">
        {submissions.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No pending submissions.</p>
        )}
        {submissions.map((s) => (
          <article
            key={s.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.summary}</p>
                <p className="mt-2 text-[11px] text-[var(--faint)]">
                  {s.category} · {s.country}
                  {s.city ? ` · ${s.city}` : ""} · by {s.hunter} · £{s.normalValue}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => review(s.id, "approve")}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04140f] disabled:opacity-60"
                >
                  Approve → live
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => review(s.id, "reject")}
                  className="rounded-lg border border-[var(--alert)]/40 px-4 py-2 text-sm font-semibold text-[var(--alert)] disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
              {s.claimUrl && (
                <a
                  href={s.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--info)] underline"
                >
                  {s.claimUrl}
                </a>
              )}
              {s.claimPhone && <span>Tel {s.claimPhone}</span>}
              {s.claimEmail && <span>Email {s.claimEmail}</span>}
              {!s.claimUrl && !s.claimPhone && !s.claimEmail && (
                <span className="text-[var(--warn)]">No claim contact provided</span>
              )}
            </div>
            {s.howToClaim && (
              <p className="mt-2 whitespace-pre-line text-xs text-[var(--text)]">{s.howToClaim}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

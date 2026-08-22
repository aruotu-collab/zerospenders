"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitOfferFind } from "@/lib/actions";
import { COUNTRIES } from "@/lib/countries";

const CATEGORIES = [
  { value: "GET", label: "GET FREE" },
  { value: "GO", label: "GO FREE" },
  { value: "EAT", label: "EAT FREE" },
  { value: "LEARN", label: "LEARN FREE" },
  { value: "PLAY", label: "PLAY FREE" },
  { value: "TRY", label: "TRY FREE" },
  { value: "KIDS", label: "KIDS FREE" },
  { value: "ONLINE", label: "ONLINE FREE" },
] as const;

export function SubmitOfferForm({ authed }: { authed: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!authed) {
    return (
      <div className="surface rounded-2xl p-8 text-center">
        <p className="text-[var(--muted)]">
          Join free to submit FREE finds. Hunters grow the board for everyone.
        </p>
        <Link
          href="/join"
          className="mt-5 inline-flex rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]"
        >
          Join free
        </Link>
      </div>
    );
  }

  return (
    <form
      className="surface space-y-4 rounded-2xl p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        const form = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await submitOfferFind({
            title: String(form.get("title") || ""),
            summary: String(form.get("summary") || ""),
            category: String(form.get("category") || "GET") as
              | "GET"
              | "GO"
              | "EAT"
              | "LEARN"
              | "PLAY"
              | "TRY"
              | "KIDS"
              | "ONLINE",
            country: String(form.get("country") || "GB"),
            city: String(form.get("city") || ""),
            location: String(form.get("city") || "Nationwide"),
            claimUrl: String(form.get("claimUrl") || ""),
            claimPhone: String(form.get("claimPhone") || ""),
            claimEmail: String(form.get("claimEmail") || ""),
            howToClaim: String(form.get("howToClaim") || ""),
            normalValue: Number(form.get("normalValue") || 0),
          });
          if (!result.ok) {
            setError(
              result.error === "auth_required"
                ? "Please sign in again."
                : "Could not submit. Check the fields and try again."
            );
            return;
          }
          setMessage("Submitted for review. We’ll verify and publish strong finds.");
          e.currentTarget.reset();
        });
      }}
    >
      <div>
        <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">Title</label>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Free entry — City Art Gallery"
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
        />
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
          What’s free / how to claim
        </label>
        <textarea
          name="summary"
          required
          rows={4}
          maxLength={500}
          placeholder="Short clear details: what’s free, any signup, and why it’s £0."
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">Category</label>
          <select
            name="category"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">Country</label>
          <select
            name="country"
            defaultValue="GB"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
            <option value="GLOBAL">Worldwide / Online</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">City</label>
          <input
            name="city"
            placeholder="London"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
            Normal value (£/$ approx)
          </label>
          <input
            name="normalValue"
            type="number"
            min={0}
            step="0.01"
            defaultValue={0}
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
          Claim / official URL
        </label>
        <input
          name="claimUrl"
          type="url"
          placeholder="https://"
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
            Phone to call (optional)
          </label>
          <input
            name="claimPhone"
            type="tel"
            placeholder="e.g. 020 7946 0000"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
            Email to contact (optional)
          </label>
          <input
            name="claimEmail"
            type="email"
            placeholder="info@venue.co.uk"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold tracking-wide text-[var(--muted)]">
          Step-by-step how to claim
        </label>
        <textarea
          name="howToClaim"
          rows={3}
          maxLength={800}
          placeholder="1. Open the website…&#10;2. Sign up / book…&#10;3. Bring confirmation…"
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)]/50"
        />
      </div>
      <input type="hidden" name="location" value="" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit FREE find"}
      </button>
      {message && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-3 text-sm text-[var(--accent)]">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-[var(--alert)]/30 bg-[rgba(255,90,60,0.1)] px-4 py-3 text-sm text-[var(--alert)]">
          {error}
        </p>
      )}
    </form>
  );
}

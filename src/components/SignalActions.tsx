"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  getMySignalState,
  toggleClaim,
  toggleReminder,
  toggleWatch,
} from "@/lib/actions";
import { ShareDeal } from "@/components/ShareDeal";

export function SignalActions({
  signalId,
  title,
  normalValue,
  cancelReminder,
  hasClaimPath = false,
}: {
  signalId: string;
  title: string;
  normalValue: number;
  cancelReminder: boolean;
  hasClaimPath?: boolean;
}) {
  const [claimed, setClaimed] = useState(false);
  const [watching, setWatching] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getMySignalState(signalId).then((state) => {
      setClaimed(state.claimed);
      setWatching(state.watching);
      setReminded(state.reminded);
      setAuthed(state.authed);
      setReady(true);
    });
  }, [signalId]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  function run(
    action: () => Promise<{ ok: boolean; error?: string; claimed?: boolean; watching?: boolean; reminded?: boolean }>,
    apply: (result: { claimed?: boolean; watching?: boolean; reminded?: boolean }) => void,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok && result.error === "auth_required") {
        setToast("Join free first to claim and watch signals.");
        return;
      }
      if (!result.ok) {
        setToast("Something went wrong. Try again.");
        return;
      }
      apply(result);
      setAuthed(true);
      setToast(successMessage);
    });
  }

  if (!ready) {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="h-11 w-36 animate-pulse rounded-lg bg-[var(--border)]" />
        <div className="h-11 w-40 animate-pulse rounded-lg bg-[var(--border)]" />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <p className="text-sm text-[var(--muted)]">
        {hasClaimPath ? (
          <>
            Use <span className="font-semibold text-white">How to get this FREE</span> above for the
            official website, phone or email. Saving below only keeps it on your board.
          </>
        ) : (
          <>
            No official claim link yet — confirm at the venue. Saving below keeps this find on your
            board.
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => toggleClaim(signalId),
              (r) => setClaimed(!!r.claimed),
              claimed
                ? "Removed from your claims."
                : `Saved “${title}” to your claims board.`
            )
          }
          className={`rounded-lg px-5 py-3 text-sm font-bold transition disabled:opacity-60 ${
            claimed
              ? "border border-[var(--accent)]/40 bg-[var(--accent-dim)] text-[var(--accent)]"
              : "border border-[var(--border-strong)] text-white hover:border-[var(--accent)]/40"
          }`}
        >
          {claimed ? "✓ Saved to claims" : "Save to my claims"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => toggleWatch(signalId),
              (r) => setWatching(!!r.watching),
              watching
                ? "Stopped watching this signal."
                : `Watching “${title}”.`
            )
          }
          className={`rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
            watching
              ? "border-[var(--info)]/50 bg-[rgba(61,184,255,0.1)] text-[var(--info)]"
              : "border-[var(--border-strong)] text-white hover:border-[var(--accent)]/40"
          }`}
        >
          {watching ? "● Watching" : "Watch this signal"}
        </button>

        {cancelReminder && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () => toggleReminder(signalId),
                (r) => setReminded(!!r.reminded),
                reminded
                  ? "Cancel reminder removed."
                  : "Cancel reminder set — we’ll nudge you before billing."
              )
            }
            className={`rounded-lg border px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
              reminded
                ? "border-[var(--warn)]/60 bg-[rgba(255,176,32,0.16)] text-[var(--warn)]"
                : "border-[var(--warn)]/40 bg-[rgba(255,176,32,0.08)] text-[var(--warn)]"
            }`}
          >
            {reminded ? "✓ Reminder on" : "Set cancel reminder"}
          </button>
        )}

        <ShareDeal
          signalId={signalId}
          title={title}
          normalValue={normalValue}
          authed={authed}
        />
      </div>

      {!authed && (
        <p className="text-sm text-[var(--muted)]">
          <Link href="/join" className="font-semibold text-[var(--accent)]">
            Join free
          </Link>{" "}
          to save claims, watches and shared finds across devices.
        </p>
      )}

      {authed && watching && (
        <p className="text-sm text-[var(--muted)]">
          On your watch board.{" "}
          <Link href="/watching" className="font-semibold text-[var(--info)]">
            Open Watching →
          </Link>
        </p>
      )}

      {authed && claimed && !watching && (
        <p className="text-sm text-[var(--muted)]">
          Saved to your claims.{" "}
          <Link href="/claimed" className="font-semibold text-[var(--accent)]">
            Open Claimed →
          </Link>
        </p>
      )}

      {toast && (
        <div
          role="status"
          className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-3 text-sm text-[var(--accent)]"
        >
          {toast}
          {toast.startsWith("Watching") && (
            <>
              {" "}
              <Link href="/watching" className="font-bold underline">
                View watch board
              </Link>
            </>
          )}
          {(toast.includes("Saved") || toast.includes("claims")) && (
            <>
              {" "}
              <Link href="/claimed" className="font-bold underline">
                View claimed board
              </Link>
            </>
          )}
          {toast.includes("Join free") && (
            <>
              {" "}
              <Link href="/join" className="font-bold underline">
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

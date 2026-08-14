"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoredState = {
  claimed: string[];
  watching: string[];
  reminders: string[];
};

const STORAGE_KEY = "zs-signal-actions";

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return { claimed: [], watching: [], reminders: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { claimed: [], watching: [], reminders: [] };
    return { claimed: [], watching: [], reminders: [], ...JSON.parse(raw) };
  } catch {
    return { claimed: [], watching: [], reminders: [] };
  }
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function SignalActions({
  signalId,
  title,
  cancelReminder,
}: {
  signalId: string;
  title: string;
  cancelReminder: boolean;
}) {
  const [state, setState] = useState<StoredState>({
    claimed: [],
    watching: [],
    reminders: [],
  });
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const claimed = state.claimed.includes(signalId);
  const watching = state.watching.includes(signalId);
  const reminded = state.reminders.includes(signalId);

  function update(next: StoredState, message: string) {
    setState(next);
    saveState(next);
    setToast(message);
  }

  function toggle(list: keyof StoredState, onMessage: string, offMessage: string) {
    const has = state[list].includes(signalId);
    const nextList = has
      ? state[list].filter((id) => id !== signalId)
      : [...state[list], signalId];
    update({ ...state, [list]: nextList }, has ? offMessage : onMessage);
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            toggle(
              "claimed",
              `Claimed “${title}” — saved to your dashboard.`,
              "Claim removed."
            )
          }
          className={`rounded-lg px-5 py-3 text-sm font-bold transition ${
            claimed
              ? "border border-[var(--accent)]/40 bg-[var(--accent-dim)] text-[var(--accent)]"
              : "bg-[var(--accent)] text-[#04140f] hover:brightness-110"
          }`}
        >
          {claimed ? "✓ Claimed" : "Claim FREE →"}
        </button>

        <button
          type="button"
          onClick={() =>
            toggle(
              "watching",
              `Watching “${title}”. We’ll surface updates on your board.`,
              "Stopped watching this signal."
            )
          }
          className={`rounded-lg border px-5 py-3 text-sm font-semibold transition ${
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
            onClick={() =>
              toggle(
                "reminders",
                "Cancel reminder set — we’ll nudge you before billing.",
                "Cancel reminder removed."
              )
            }
            className={`rounded-lg border px-5 py-3 text-sm font-semibold transition ${
              reminded
                ? "border-[var(--warn)]/60 bg-[rgba(255,176,32,0.16)] text-[var(--warn)]"
                : "border-[var(--warn)]/40 bg-[rgba(255,176,32,0.08)] text-[var(--warn)]"
            }`}
          >
            {reminded ? "✓ Reminder on" : "Set cancel reminder"}
          </button>
        )}
      </div>

      {(claimed || watching) && (
        <p className="text-sm text-[var(--muted)]">
          Saved locally for now.{" "}
          <Link href="/dashboard" className="font-semibold text-[var(--accent)]">
            Open dashboard
          </Link>{" "}
          to see claimed and watched signals.
        </p>
      )}

      {toast && (
        <div
          role="status"
          className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-4 py-3 text-sm text-[var(--accent)]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

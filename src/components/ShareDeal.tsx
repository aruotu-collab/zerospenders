"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { recordSignalShare } from "@/lib/actions";
import { formatGBP } from "@/lib/data";

function buildSharePayload(signalId: string, title: string, normalValue: number) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/signals/${signalId}?ref=share`
      : `https://zerospenders.com/signals/${signalId}?ref=share`;
  const text = `Found this FREE on ZeroSpenders: ${title} — normally ${formatGBP(normalValue)}, now £0. Check it before it goes:`;
  return { url, text, full: `${text} ${url}` };
}

export function ShareDeal({
  signalId,
  title,
  normalValue,
  variant = "button",
  authed = false,
}: {
  signalId: string;
  title: string;
  normalValue: number;
  variant?: "button" | "compact";
  authed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  function trackShare() {
    if (!authed) return;
    startTransition(async () => {
      await recordSignalShare(signalId);
    });
  }

  async function shareNative() {
    const { url, text } = buildSharePayload(signalId, title, normalValue);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} · FREE on ZeroSpenders`, text, url });
        trackShare();
        setToast("Shared with a friend.");
        setOpen(false);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    setOpen(true);
  }

  async function copyLink() {
    const { url } = buildSharePayload(signalId, title, normalValue);
    try {
      await navigator.clipboard.writeText(url);
      trackShare();
      setToast("Link copied — paste it to a friend.");
      setOpen(false);
    } catch {
      setToast("Couldn’t copy — try WhatsApp or Messages instead.");
      setOpen(true);
    }
  }

  function openChannel(kind: "whatsapp" | "sms" | "email") {
    const { url, text, full } = buildSharePayload(signalId, title, normalValue);
    const href =
      kind === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(full)}`
        : kind === "sms"
          ? `sms:?&body=${encodeURIComponent(full)}`
          : `mailto:?subject=${encodeURIComponent(`FREE: ${title}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    trackShare();
    window.open(href, "_blank", "noopener,noreferrer");
    setToast("Opening share…");
    setOpen(false);
  }

  const buttonClass =
    variant === "compact"
      ? "rounded-md border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--info)] transition hover:border-[var(--info)]/50 hover:bg-[rgba(61,184,255,0.08)]"
      : "rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:border-[var(--info)]/50 hover:bg-[rgba(61,184,255,0.08)] disabled:opacity-60";

  return (
    <div className={variant === "compact" ? "relative inline-flex" : "relative"}>
      <button
        type="button"
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canNativeShare) {
            void shareNative();
          } else {
            setOpen((v) => !v);
          }
        }}
        className={buttonClass}
      >
        {variant === "compact" ? "Share" : "Share with a friend"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Share this FREE deal"
          className={`absolute z-20 mt-2 w-[min(100vw-2rem,280px)] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 shadow-xl ${
            variant === "compact" ? "right-0 top-full" : "left-0 top-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-[var(--muted)]">
            Send this FREE signal to someone who’ll love it.
          </p>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm font-semibold text-white hover:border-[var(--accent)]/40"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => openChannel("whatsapp")}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm font-semibold text-white hover:border-[var(--accent)]/40"
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => openChannel("sms")}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm font-semibold text-white hover:border-[var(--accent)]/40"
            >
              Messages / SMS
            </button>
            <button
              type="button"
              onClick={() => openChannel("email")}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm font-semibold text-white hover:border-[var(--accent)]/40"
            >
              Email
            </button>
            {canNativeShare && (
              <button
                type="button"
                onClick={() => void shareNative()}
                className="rounded-lg bg-[var(--info)]/15 px-3 py-2 text-left text-sm font-semibold text-[var(--info)]"
              >
                More apps…
              </button>
            )}
          </div>
          {!authed && (
            <p className="mt-3 text-[11px] text-[var(--faint)]">
              <Link href="/join" className="font-semibold text-[var(--accent)]">
                Join free
              </Link>{" "}
              to sync shares with your hunter board.
            </p>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full text-center text-[11px] text-[var(--muted)] hover:text-white"
          >
            Close
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`absolute z-30 whitespace-nowrap rounded-lg border border-[var(--info)]/30 bg-[rgba(61,184,255,0.12)] px-3 py-2 text-xs text-[var(--info)] ${
            variant === "compact" ? "right-0 top-[calc(100%+0.5rem)]" : "left-0 top-[calc(100%+0.5rem)]"
          }`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

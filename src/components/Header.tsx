"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/data";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[rgba(7,9,12,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-dim)] font-display text-sm font-bold text-[var(--accent)]">
            £0
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-tight text-white group-hover:text-[var(--accent)]">
              ZeroSpenders
            </div>
            <div className="hidden text-[11px] tracking-[0.12em] text-[var(--muted)] sm:block">
              Intelligence for £0 opportunities
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {CATEGORIES.slice(0, 7).map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-md px-2.5 py-1.5 text-xs font-semibold tracking-wide text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/live"
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-2.5 py-1.5 text-xs font-bold tracking-wide text-[var(--accent)]"
          >
            <span className="live-dot" />
            LIVE
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/creators"
            className="hidden rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-white md:inline"
          >
            Creators
          </Link>
          <Link
            href="/brands"
            className="hidden rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-white md:inline"
          >
            Brands
          </Link>
          <Link
            href="/join"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[#04140f] transition hover:brightness-110"
          >
            Join Free
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border)] text-[var(--muted)] lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text)]"
              >
                {c.label}
              </Link>
            ))}
            <Link href="/creators" onClick={() => setOpen(false)} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">
              Creators
            </Link>
            <Link href="/brands" onClick={() => setOpen(false)} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">
              Brands
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="col-span-2 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              Member Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

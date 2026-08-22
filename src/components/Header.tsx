"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { CountrySelect } from "@/components/CountrySelect";
import { countryLabel, type CountryCode } from "@/lib/countries";

const CATEGORY_LINKS = CATEGORIES.filter((c) =>
  ["get", "go", "eat", "learn", "play", "try", "kids", "online", "near", "today"].includes(c.slug)
);

export function Header({
  initialCountry,
  showAdmin = false,
}: {
  initialCountry?: CountryCode;
  showAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const countryName = countryLabel(initialCountry ?? "GB");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[rgba(7,9,12,0.92)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        {/* Row 1 — logo + utilities */}
        <div className="flex items-center justify-between gap-6 py-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-dim)] font-display text-sm font-bold text-[var(--accent)]">
              £0
            </span>
            <div className="leading-tight">
              <div className="font-display text-[17px] font-bold tracking-tight text-white group-hover:text-[var(--accent)]">
                ZeroSpenders
              </div>
              <div className="hidden text-[10px] tracking-[0.14em] text-[var(--muted)] sm:block">
                Intelligence for £0 opportunities
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-0.5 sm:flex">
              <Link
                href="/live"
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-dim)] px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-[var(--accent)]"
              >
                <span className="live-dot" />
                LIVE
              </Link>
              <Link
                href="/watching"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--info)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                Watching
              </Link>
              <Link
                href="/claimed"
                className="hidden rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white md:inline"
              >
                Claimed
              </Link>
            </div>

            <div className="hidden items-center gap-0.5 lg:flex">
              <Link
                href="/submit"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                Submit
              </Link>
              <Link
                href="/creators"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                Creators
              </Link>
              <Link
                href="/brands"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                Brands
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                Dashboard
              </Link>
              {showAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-[var(--warn)] transition hover:bg-[var(--surface)] hover:text-white"
                >
                  Admin
                </Link>
              )}
            </div>

            <Link
              href="/join"
              className="ml-0.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-[11px] font-bold text-[#04140f] transition hover:brightness-110"
            >
              Join Free
            </Link>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] text-[var(--muted)] md:hidden"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Row 2 — country (between logo and FREE menus) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)]/60 py-2.5">
          <CountrySelect initialCountry={initialCountry} />
          <p className="text-[11px] text-[var(--muted)]">
            FREE menus below update for{" "}
            <span className="font-semibold text-[var(--info)]">{countryName}</span>
          </p>
        </div>

        {/* Row 3 — category menus */}
        <nav className="hidden border-t border-[var(--border)]/60 md:block">
          <div className="flex items-center gap-0.5 overflow-x-auto py-1.5 scrollbar-thin">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="shrink-0 rounded-md px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-white"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 md:hidden">
          <div className="mb-3 grid grid-cols-2 gap-2">
            {CATEGORY_LINKS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text)]"
              >
                {c.label}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/live"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs font-semibold text-[var(--accent)]"
            >
              LIVE
            </Link>
            <Link
              href="/watching"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--info)]/30 bg-[rgba(61,184,255,0.08)] px-3 py-2 text-xs font-semibold text-[var(--info)]"
            >
              Watching
            </Link>
            <Link
              href="/claimed"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"
            >
              Claimed
            </Link>
            <Link
              href="/creators"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"
            >
              Creators
            </Link>
            <Link
              href="/brands"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold"
            >
              Brands
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs font-semibold text-[var(--accent)]"
            >
              Dashboard
            </Link>
            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--warn)]/40 bg-[rgba(255,176,32,0.12)] px-3 py-2 text-xs font-bold text-[var(--warn)]"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

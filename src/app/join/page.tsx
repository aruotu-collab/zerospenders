"use client";

import { useState } from "react";
import Link from "next/link";

const INTERESTS = [
  "Food & drink",
  "Days out",
  "Kids & family",
  "Free samples",
  "Beauty",
  "Games",
  "Software & AI",
  "Courses",
  "Entertainment",
  "Travel",
  "Everything!",
];

export default function JoinPage() {
  const [selected, setSelected] = useState<string[]>(["Everything!"]);
  const [role, setRole] = useState<"member" | "creator" | "brand">("member");

  function toggle(item: string) {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">JOIN FREE</p>
      <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">
        Start hunting £0 opportunities
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Free forever for core access. Tell us what you want and we personalise your intelligence
        board.
      </p>

      <div className="mt-8 flex gap-2 rounded-xl border border-[var(--border)] p-1">
        {(
          [
            ["member", "Member"],
            ["creator", "Creator"],
            ["brand", "Brand"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setRole(id)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
              role === id
                ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="surface mt-6 space-y-5 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = "/dashboard";
        }}
      >
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Name</span>
          <input
            required
            defaultValue="James"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            required
            type="email"
            placeholder="you@email.com"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Postcode</span>
          <input
            required
            defaultValue="SW1"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
          />
        </label>

        {role !== "brand" && (
          <div>
            <div className="text-sm text-[var(--muted)]">What FREE things do you want?</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const on = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggle(item)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      on
                        ? "border-[var(--accent)]/50 bg-[var(--accent-dim)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {on ? "☑ " : "☐ "}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-bold text-[#04140f]"
        >
          {role === "brand"
            ? "Create brand account"
            : role === "creator"
              ? "Create creator account"
              : "Create free account"}
        </button>
        <p className="text-center text-xs text-[var(--faint)]">
          Already hunting?{" "}
          <Link href="/dashboard" className="text-[var(--accent)]">
            Open dashboard
          </Link>
        </p>
      </form>
    </div>
  );
}

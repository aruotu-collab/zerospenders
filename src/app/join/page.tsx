"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/lib/actions";

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
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [selected, setSelected] = useState<string[]>(["Everything!"]);
  const [role, setRole] = useState<"MEMBER" | "CREATOR" | "BRAND">("MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(item: string) {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">JOIN FREE</p>
      <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">
        {mode === "register" ? "Start hunting £0 opportunities" : "Welcome back"}
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Free forever for core access. Accounts sync claims, watches and cancel reminders.
      </p>

      <div className="mt-6 flex gap-2 rounded-xl border border-[var(--border)] p-1">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mode === "register"
              ? "bg-[var(--accent-dim)] text-[var(--accent)]"
              : "text-[var(--muted)]"
          }`}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mode === "login"
              ? "bg-[var(--accent-dim)] text-[var(--accent)]"
              : "text-[var(--muted)]"
          }`}
        >
          Sign in
        </button>
      </div>

      {mode === "register" && (
        <div className="mt-4 flex gap-2 rounded-xl border border-[var(--border)] p-1">
          {(
            [
              ["MEMBER", "Member"],
              ["CREATOR", "Creator"],
              ["BRAND", "Brand"],
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
      )}

      <form
        className="surface mt-6 space-y-5 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const form = new FormData(e.currentTarget);
          const email = String(form.get("email") || "");
          const password = String(form.get("password") || "");
          const name = String(form.get("name") || "");
          const postcode = String(form.get("postcode") || "");

          startTransition(async () => {
            if (mode === "login") {
              const result = await loginUser(email, password);
              if (!result.ok) {
                setError(result.error ?? "Login failed");
                return;
              }
              router.push("/dashboard");
              router.refresh();
              return;
            }

            const result = await registerUser({
              name,
              email,
              password,
              postcode,
              role,
              interests: selected,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push("/dashboard");
            router.refresh();
          });
        }}
      >
        {mode === "register" && (
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Name</span>
            <input
              name="name"
              required
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
            />
          </label>
        )}
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Email</span>
          <input
            name="email"
            required
            type="email"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Password</span>
          <input
            name="password"
            required
            type="password"
            minLength={6}
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
          />
        </label>
        {mode === "register" && (
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Postcode</span>
            <input
              name="postcode"
              defaultValue="SW1"
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
            />
          </label>
        )}

        {mode === "register" && role !== "BRAND" && (
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

        {error && (
          <p className="rounded-lg border border-[var(--alert)]/40 bg-[rgba(255,90,60,0.1)] px-3 py-2 text-sm text-[var(--alert)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-bold text-[#04140f] disabled:opacity-60"
        >
          {pending
            ? "Working…"
            : mode === "login"
              ? "Sign in"
              : role === "BRAND"
                ? "Create brand account"
                : role === "CREATOR"
                  ? "Create creator account"
                  : "Create free account"}
        </button>
        <p className="text-center text-xs text-[var(--faint)]">
          Or browse without an account on the{" "}
          <Link href="/live" className="text-[var(--accent)]">
            live board
          </Link>
        </p>
      </form>
    </div>
  );
}

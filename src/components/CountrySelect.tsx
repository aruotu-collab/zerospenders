"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  COUNTRIES,
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  resolveCountry,
  type CountryCode,
} from "@/lib/countries";

function readCookieCountry(): CountryCode {
  if (typeof document === "undefined") return DEFAULT_COUNTRY;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COUNTRY_COOKIE}=`));
  return resolveCountry(match?.split("=")[1]);
}

function writeCookieCountry(code: CountryCode) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=${maxAge}; samesite=lax`;
  try {
    localStorage.setItem(COUNTRY_COOKIE, code);
  } catch {
    // ignore storage failures
  }
}

export function CountrySelect({
  initialCountry = DEFAULT_COUNTRY,
  compact = false,
}: {
  initialCountry?: CountryCode;
  compact?: boolean;
}) {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCountry(readCookieCountry());
  }, []);

  function onChange(next: string) {
    const code = resolveCountry(next);
    setCountry(code);
    writeCookieCountry(code);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label
      className={`flex min-w-0 flex-wrap items-center gap-2 ${compact ? "w-full" : ""}`}
      title="Country of interest"
    >
      <span className="shrink-0 text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)]">
        SELECT COUNTRY
      </span>
      <select
        value={country}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select country of interest"
        className={`rounded-md border border-[var(--accent)]/35 bg-[var(--bg-elevated)] text-white outline-none transition hover:border-[var(--accent)]/60 focus:border-[var(--accent)] disabled:opacity-60 ${
          compact
            ? "w-full px-3 py-2.5 text-sm font-semibold"
            : "min-w-[160px] px-3 py-2 text-sm font-semibold"
        }`}
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function param(search: URLSearchParams, key: string) {
  return search.get(key) || search.get(key.toUpperCase()) || null;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastPath.current === key) return;
    lastPath.current = key;

    const body = {
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      source: param(searchParams, "utm_source"),
      medium: param(searchParams, "utm_medium"),
      campaign: param(searchParams, "utm_campaign"),
    };

    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/visit", blob);
      return;
    }

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}

export function trackClick(input: {
  targetType: string;
  targetId?: string | null;
  targetLabel?: string | null;
  href?: string | null;
}) {
  if (typeof window === "undefined") return;
  const body = {
    path: window.location.pathname,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    targetLabel: input.targetLabel ?? null,
    href: input.href ?? null,
  };
  const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/click", blob);
    return;
  }
  void fetch("/api/analytics/click", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

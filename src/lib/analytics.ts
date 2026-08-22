import { headers } from "next/headers";

export function clientIpFromHeaders(h: Headers) {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 80);
  }
  const real = h.get("x-real-ip") || h.get("cf-connecting-ip") || h.get("x-vercel-forwarded-for");
  return real?.trim().slice(0, 80) || null;
}

export function requestMetaFromHeaders(h: Headers) {
  return {
    ip: clientIpFromHeaders(h),
    userAgent: h.get("user-agent")?.slice(0, 400) || null,
    country: h.get("x-vercel-ip-country")?.slice(0, 8) || null,
  };
}

export async function requestMeta() {
  return requestMetaFromHeaders(await headers());
}

/** Classify how someone found the site from referrer + UTM fields. */
export function classifySource(input: {
  referrer?: string | null;
  source?: string | null;
  medium?: string | null;
}) {
  const utm = (input.source || "").trim().toLowerCase();
  if (utm) return utm.slice(0, 80);

  const ref = (input.referrer || "").trim();
  if (!ref) return "direct";

  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("google.")) return "google";
    if (host.includes("bing.")) return "bing";
    if (host.includes("duckduckgo.")) return "duckduckgo";
    if (host.includes("facebook.") || host.includes("fb.")) return "facebook";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("t.co") || host.includes("twitter.") || host.includes("x.com")) return "x";
    if (host.includes("linkedin.")) return "linkedin";
    if (host.includes("reddit.")) return "reddit";
    if (host.includes("youtube.")) return "youtube";
    if (host.includes("zerospenders.")) return "internal";
    return host.slice(0, 80);
  } catch {
    return "referral";
  }
}

export function isBotUserAgent(ua: string | null | undefined) {
  if (!ua) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless/i.test(ua);
}

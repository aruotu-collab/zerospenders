const FREE_KEYWORDS = [
  "free",
  "£0",
  "$0",
  "no cost",
  "complimentary",
  "gratis",
  "trial",
  "sample",
  "giveaway",
  "no payment",
];

const EXPIRED_KEYWORDS = [
  "no longer available",
  "offer ended",
  "has ended",
  "sold out",
  "expired",
  "not available",
  "page not found",
];

export type VerifyResult = {
  ok: boolean;
  score: number;
  statusCode: number | null;
  notes: string[];
};

function keywordHits(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).length;
}

export async function verifyClaimUrl(
  claimUrl: string,
  title: string,
  summary: string
): Promise<VerifyResult> {
  const notes: string[] = [];
  let statusCode: number | null = null;

  if (!claimUrl.startsWith("http")) {
    return { ok: false, score: 0, statusCode: null, notes: ["Invalid URL"] };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(claimUrl, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "ZeroSpendersBot/1.0 (+https://zerospenders.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    statusCode = res.status;

    if (statusCode < 200 || statusCode >= 400) {
      notes.push(`HTTP ${statusCode}`);
      return { ok: false, score: 10, statusCode, notes };
    }

    const contentType = res.headers.get("content-type") || "";
    let body = "";
    if (contentType.includes("text") || contentType.includes("html")) {
      body = (await res.text()).slice(0, 120_000);
    }

    const combined = `${title} ${summary} ${body}`;
    const freeHits = keywordHits(combined, FREE_KEYWORDS);
    const expiredHits = keywordHits(combined, EXPIRED_KEYWORDS);

    if (expiredHits > 0) {
      notes.push("Expired keywords detected");
      return { ok: false, score: 20, statusCode, notes };
    }

    let score = 55;
    if (freeHits > 0) score += Math.min(freeHits * 8, 32);
    if (claimUrl.includes("eventbrite.")) score += 10;
    if (claimUrl.includes("gov.uk")) score += 8;
    score = Math.min(score, 98);

    notes.push(`Free signals: ${freeHits}`);
    return { ok: score >= 60, score, statusCode, notes };
  } catch (err) {
    notes.push(err instanceof Error ? err.message : "Fetch failed");
    return { ok: false, score: 0, statusCode, notes };
  }
}

export function inferCategory(text: string): import("@prisma/client").SignalCategory {
  const t = text.toLowerCase();
  if (/\btrial\b|subscribe|subscription|premium/.test(t)) return "TRY";
  if (/\bsample\b|giveaway|voucher|coupon/.test(t)) return "GET";
  if (/\bfood\b|meal|restaurant|pizza|coffee|eat\b/.test(t)) return "EAT";
  if (/\bkids\b|child|baby|family/.test(t)) return "KIDS";
  if (/\bcourse\b|learn|webinar|workshop|library/.test(t)) return "LEARN";
  if (/\bgame\b|play|cinema|gym|parkrun/.test(t)) return "PLAY";
  if (/\bonline\b|app\b|streaming|digital/.test(t)) return "ONLINE";
  if (/\bmuseum\b|gallery|event\b|festival|park\b/.test(t)) return "GO";
  return "GET";
}

export function slugifyOffer(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

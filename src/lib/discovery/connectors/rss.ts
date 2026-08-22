import type { RawCandidate } from "@/lib/discovery/types";
import { RSS_FEEDS } from "@/lib/discovery/types";
import { inferCategory } from "@/lib/discovery/verify-offer";

function parseRssItems(xml: string) {
  const items: { title: string; link: string; description: string }[] = [];
  const chunks = xml.split(/<item[\s>]/i).slice(1);
  for (const chunk of chunks) {
    const title = chunk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
    const link = chunk.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
    const description =
      chunk.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() ||
      "";
    if (title && link) {
      items.push({
        title: title.replace(/<[^>]+>/g, "").slice(0, 120),
        link: link.replace(/<[^>]+>/g, ""),
        description: description.replace(/<[^>]+>/g, " ").slice(0, 480),
      });
    }
  }
  return items;
}

function slugFromUrl(url: string) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).pop() || url;
  } catch {
    return url;
  }
}

export async function fetchRssCandidates(): Promise<RawCandidate[]> {
  const out: RawCandidate[] = [];
  const extra = (process.env.DISCOVERY_RSS_FEEDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const feeds = [
    ...RSS_FEEDS,
    ...extra.map((url) => ({ name: "custom", url, country: "GB" as const })),
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "ZeroSpendersBot/1.0 (+https://zerospenders.com)" },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      for (const item of parseRssItems(xml)) {
        if (!/\bfree\b/i.test(`${item.title} ${item.description}`)) continue;
        const externalId = `rss-${slugFromUrl(item.link)}`.slice(0, 120);
        out.push({
          source: "rss",
          externalId,
          title: item.title,
          summary: item.description || item.title,
          category: inferCategory(`${item.title} ${item.description}`),
          country: feed.country,
          city: "Nationwide",
          location: feed.country === "GB" ? "UK" : "Online",
          claimUrl: item.link,
          howToClaim:
            "1. Open the deal page.\n2. Check eligibility and expiry.\n3. Claim before the offer ends.",
          normalValue: 12,
        });
      }
    } catch {
      // try next feed
    }
  }

  return out;
}

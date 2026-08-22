import type { RawCandidate } from "@/lib/discovery/types";
import { REDDIT_SOURCES } from "@/lib/discovery/types";
import { inferCategory } from "@/lib/discovery/verify-offer";

type RedditListing = {
  data?: {
    children?: {
      data?: {
        id?: string;
        title?: string;
        selftext?: string;
        url?: string;
        permalink?: string;
        over_18?: boolean;
        stickied?: boolean;
      };
    }[];
  };
};

const BLOCKED_HOSTS = ["reddit.com", "redd.it", "i.redd.it", "v.redd.it"];

function externalClaimUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (BLOCKED_HOSTS.some((h) => parsed.hostname.endsWith(h))) return null;
    return url;
  } catch {
    return null;
  }
}

function extractUrlFromText(text: string) {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  if (!match) return null;
  return externalClaimUrl(match[0].replace(/[.,]+$/, ""));
}

export async function fetchRedditCandidates(): Promise<RawCandidate[]> {
  const out: RawCandidate[] = [];

  for (const { subreddit, country } of REDDIT_SOURCES) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=25`, {
        headers: { "User-Agent": "ZeroSpendersBot/1.0 (+https://zerospenders.com)" },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const json = (await res.json()) as RedditListing;
      for (const child of json.data?.children ?? []) {
        const post = child.data;
        if (!post?.id || post.over_18 || post.stickied) continue;

        const title = post.title?.trim();
        if (!title || title.length < 8) continue;
        if (!/\bfree\b/i.test(title) && !/\bfree\b/i.test(post.selftext || "")) continue;

        const claimUrl =
          externalClaimUrl(post.url) || extractUrlFromText(post.selftext || "");
        if (!claimUrl) continue;

        const summary = (post.selftext || title).replace(/\s+/g, " ").slice(0, 480);
        out.push({
          source: "reddit",
          externalId: `${subreddit}-${post.id}`,
          title: title.slice(0, 120),
          summary,
          category: inferCategory(`${title} ${summary}`),
          country,
          city: country === "GB" ? "Nationwide" : "Online",
          location: country === "GB" ? "UK" : "Online",
          claimUrl,
          howToClaim: `1. Open the linked page from r/${subreddit}.\n2. Follow the poster's instructions.\n3. Confirm the offer is still live before travelling or signing up.`,
          normalValue: 10,
        });
      }
    } catch {
      // try next subreddit
    }
  }

  return out;
}

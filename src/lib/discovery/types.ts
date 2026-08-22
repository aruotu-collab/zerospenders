import type { SignalCategory } from "@prisma/client";

export type DiscoverySource = "eventbrite" | "reddit" | "rss" | "hunter";

export type RawCandidate = {
  source: DiscoverySource;
  externalId: string;
  title: string;
  summary: string;
  category: SignalCategory;
  country: string;
  city: string;
  location: string;
  claimUrl: string;
  howToClaim: string;
  normalValue: number;
};

export type DiscoveryStats = {
  found: number;
  queued: number;
  published: number;
  skipped: number;
  errors: string[];
  sources: Record<string, number>;
};

export const UK_DISCOVERY_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Edinburgh",
  "Liverpool",
  "Bristol",
  "Sheffield",
  "Newcastle",
  "Nottingham",
  "Cardiff",
  "Belfast",
  "Leicester",
  "Brighton",
  "Southampton",
  "Cambridge",
  "Oxford",
  "York",
  "Reading",
] as const;

export const REDDIT_SOURCES = [
  { subreddit: "UKFreebies", country: "GB" },
  { subreddit: "FreebiesUK", country: "GB" },
  { subreddit: "Freefood", country: "GLOBAL" },
] as const;

export const RSS_FEEDS = [
  {
    name: "HotUKDeals free",
    url: "https://www.hotukdeals.com/rss/hot?q=free",
    country: "GB",
  },
] as const;

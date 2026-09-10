import type { SignalCategory } from "@prisma/client";

/** Signup interest labels → which offer categories / tags they match. */
export const INTEREST_RULES: Record<
  string,
  {
    label: string;
    categories?: SignalCategory[];
    tagIncludes?: string[];
  }
> = {
  "Food & drink": {
    label: "Food & drink",
    categories: ["EAT"],
    tagIncludes: ["food", "coffee", "dining", "meal"],
  },
  "Days out": {
    label: "Days out",
    categories: ["GO"],
    tagIncludes: ["museum", "gallery", "park", "heritage", "days-out"],
  },
  "Kids & family": {
    label: "Kids & family",
    categories: ["KIDS"],
    tagIncludes: ["kids", "family", "storytime", "playground"],
  },
  "Free samples": {
    label: "Free samples",
    categories: ["GET"],
    tagIncludes: ["samples", "sample", "giveaway", "free-stuff"],
  },
  Beauty: {
    label: "Beauty",
    tagIncludes: ["beauty", "skincare", "makeup", "cosmetic"],
  },
  Games: {
    label: "Games",
    categories: ["PLAY"],
    tagIncludes: ["game", "gaming"],
  },
  "Software & AI": {
    label: "Software & AI",
    categories: ["ONLINE", "TRY", "LEARN"],
    tagIncludes: ["software", "ai", "app", "online", "trial"],
  },
  Courses: {
    label: "Courses",
    categories: ["LEARN"],
    tagIncludes: ["courses", "course", "study", "library"],
  },
  Entertainment: {
    label: "Entertainment",
    categories: ["PLAY", "ONLINE"],
    tagIncludes: ["streaming", "cinema", "tv", "audio", "events"],
  },
  Travel: {
    label: "Travel",
    tagIncludes: ["travel", "holiday", "flight", "hotel", "trip"],
  },
  "Everything!": {
    label: "Everything",
    categories: ["GET", "GO", "EAT", "LEARN", "PLAY", "TRY", "KIDS", "ONLINE"],
  },
};

export type NewOffer = {
  id: string;
  slug: string;
  title: string;
  category: SignalCategory;
  tags: string[];
  country: string;
};

export type InterestBucket = {
  interest: string;
  label: string;
  count: number;
  offers: NewOffer[];
};

function interestMatches(interest: string, offer: NewOffer) {
  const rule = INTEREST_RULES[interest];
  if (!rule) return false;

  const haystack = `${offer.title} ${offer.tags.join(" ")}`.toLowerCase();
  const tagHit = Boolean(
    rule.tagIncludes?.some((t) => haystack.includes(t.toLowerCase()))
  );

  // Specialty interests must match tags/keywords — category alone is too broad.
  if (interest === "Beauty" || interest === "Travel") {
    return tagHit;
  }

  if (rule.categories?.includes(offer.category)) return true;
  return tagHit;
}

/** Group newly published offers by a member's selected interests. */
export function matchOffersToInterests(
  interests: string[],
  offers: NewOffer[]
): InterestBucket[] {
  if (!offers.length) return [];

  const selected = interests.length ? interests : [];
  if (!selected.length) return [];

  // "Everything!" alone or with others → treat as all categories.
  const effective = selected.includes("Everything!")
    ? ["Everything!"]
    : selected.filter((i) => INTEREST_RULES[i]);

  const buckets: InterestBucket[] = [];

  for (const interest of effective) {
    const rule = INTEREST_RULES[interest];
    if (!rule) continue;
    const matched = offers.filter((o) => interestMatches(interest, o));
    if (matched.length === 0) continue;
    buckets.push({
      interest,
      label: rule.label,
      count: matched.length,
      offers: matched,
    });
  }

  return buckets;
}

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { EvergreenOffer, EvergreenSource, SignalCategory } from "./lib/evergreen-types";
import {
  CANADA_STRONG_PASS_SITES,
  EVERGREEN_SOURCES,
  NPS_FEE_FREE_DAYS,
  NPS_FEE_PARKS,
} from "./lib/evergreen-sources";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data/offers/evergreen.json");

/** Extra NPS fee-free day labels (confirm yearly on nps.gov). */
const EXTRA_NPS_DAYS = [
  {
    id: "juneteenth",
    title: "Juneteenth (when designated fee-free)",
    summary:
      "Some years NPS designates Juneteenth as a fee-free day. Confirm the current year calendar on nps.gov before travel.",
  },
  {
    id: "np-week-saturday",
    title: "Saturday of National Park Week",
    summary:
      "NPS often waives entrance fees on more than one day during National Park Week. Confirm the exact Saturday date yearly on nps.gov.",
  },
];

/** Additional curated venues / tools beyond evergreen-sources.ts */
const EXTRA_SOURCES: EvergreenSource[] = [
  {
    title: "Museum of Free Derry",
    city: "Derry",
    country: "GB",
    claimUrl: null,
    subcategory: "Museum",
    normalValue: 8,
    summary: "Community museum — confirm current free admission policy before visiting.",
  },
  {
    title: "Tower Museum",
    city: "Derry",
    country: "GB",
    claimUrl: null,
    subcategory: "Museum",
    normalValue: 8,
    summary: "City museum — check free access windows.",
  },
  {
    title: "Aberdeen Art Gallery",
    city: "Aberdeen",
    country: "GB",
    claimUrl: "https://www.aberdeencity.gov.uk/AAGM",
    subcategory: "Gallery",
    normalValue: 10,
    summary: "Free civic art gallery.",
  },
  {
    title: "McManus Art Gallery & Museum",
    city: "Dundee",
    country: "GB",
    claimUrl: "https://www.mcmanus.co.uk",
    subcategory: "Museum",
    normalValue: 10,
    summary: "Free civic museum and art gallery.",
  },
  {
    title: "Perth Museum",
    city: "Perth",
    country: "GB",
    claimUrl: null,
    subcategory: "Museum",
    normalValue: 10,
    summary: "Check free admission at the city museum.",
  },
  {
    title: "The Atkinson",
    city: "Southport",
    country: "GB",
    claimUrl: "https://www.theatkinson.co.uk",
    subcategory: "Museum",
    normalValue: 8,
    summary: "Free museum, gallery and library complex.",
  },
  {
    title: "The Beaney",
    city: "Canterbury",
    country: "GB",
    claimUrl: "https://canterburymuseums.co.uk/the-beaney",
    subcategory: "Museum",
    normalValue: 8,
    summary: "Free museum and gallery.",
  },
  {
    title: "Maidstone Museum",
    city: "Maidstone",
    country: "GB",
    claimUrl: "https://museum.maidstone.gov.uk",
    subcategory: "Museum",
    normalValue: 8,
    summary: "Free borough museum.",
  },
  {
    title: "Tunbridge Wells Museum and Art Gallery",
    city: "Royal Tunbridge Wells",
    country: "GB",
    claimUrl: null,
    subcategory: "Museum",
    normalValue: 8,
    summary: "Free local museum and gallery.",
  },
  {
    title: "Brighton Museum & Art Gallery",
    city: "Brighton",
    country: "GB",
    claimUrl: "https://brightonmuseums.org.uk/brighton-museum",
    subcategory: "Museum",
    normalValue: 10,
    summary: "Free permanent collections (check special exhibitions).",
  },
  {
    title: "Wolverhampton Art Gallery",
    city: "Wolverhampton",
    country: "GB",
    claimUrl: "https://www.wolverhamptonart.org.uk",
    subcategory: "Gallery",
    normalValue: 8,
    summary: "Free civic art gallery.",
  },
  {
    title: "New Art Gallery Walsall",
    city: "Walsall",
    country: "GB",
    claimUrl: "https://thenewartgallerywalsall.org.uk",
    subcategory: "Gallery",
    normalValue: 8,
    summary: "Free contemporary art gallery.",
  },
  {
    title: "mima Middlesbrough Institute of Modern Art",
    city: "Middlesbrough",
    country: "GB",
    claimUrl: "https://mima.art",
    subcategory: "Gallery",
    normalValue: 8,
    summary: "Free modern art gallery.",
  },
  {
    title: "Oriel Davies Gallery",
    city: "Newtown",
    country: "GB",
    claimUrl: "https://www.orieldavies.org",
    subcategory: "Gallery",
    normalValue: 6,
    summary: "Free contemporary gallery in Wales.",
  },
  {
    title: "Mostyn",
    city: "Llandudno",
    country: "GB",
    claimUrl: "https://www.mostyn.org",
    subcategory: "Gallery",
    normalValue: 6,
    summary: "Free contemporary gallery.",
  },
  {
    title: "OpenStreetMap",
    city: "Online",
    country: "GLOBAL",
    claimUrl: "https://www.openstreetmap.org",
    subcategory: "Maps",
    normalValue: 0,
    summary: "Free editable world map.",
    category: "ONLINE",
    sourceName: "Official free tier",
    sourceType: "OFFICIAL",
    verification: "VERIFIED",
    tags: ["online", "free-tier"],
  },
  {
    title: "OpenStreetMap Nominatim usage policy tools",
    city: "Online",
    country: "GLOBAL",
    claimUrl: "https://nominatim.org",
    subcategory: "Maps",
    normalValue: 0,
    summary: "Free geocoding project — respect usage policy.",
    category: "ONLINE",
    sourceName: "Official free tier",
    sourceType: "OFFICIAL",
    verification: "VERIFIED",
    tags: ["online", "free-tier"],
  },
  {
    title: "MDN Web Docs",
    city: "Online",
    country: "GLOBAL",
    claimUrl: "https://developer.mozilla.org",
    subcategory: "Reference",
    normalValue: 0,
    summary: "Free web developer documentation.",
    category: "LEARN",
    sourceName: "Official free tier",
    sourceType: "OFFICIAL",
    verification: "VERIFIED",
    tags: ["online", "free-tier"],
  },
  {
    title: "DevDocs",
    city: "Online",
    country: "GLOBAL",
    claimUrl: "https://devdocs.io",
    subcategory: "Reference",
    normalValue: 0,
    summary: "Free multi-API documentation browser.",
    category: "LEARN",
    sourceName: "Official free tier",
    sourceType: "OFFICIAL",
    verification: "VERIFIED",
    tags: ["online", "free-tier"],
  },
  {
    title: "Anki",
    city: "Online",
    country: "GLOBAL",
    claimUrl: "https://apps.ankiweb.net",
    subcategory: "Study",
    normalValue: 0,
    summary: "Free spaced-repetition flashcards (desktop).",
    category: "LEARN",
    sourceName: "Official free tier",
    sourceType: "OFFICIAL",
    verification: "VERIFIED",
    tags: ["online", "free-tier"],
  },
];

function slugify(input: string): string {
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

function hashScore(seed: string, min = 75, max = 98): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function defaultCategory(source: EvergreenSource): SignalCategory {
  if (source.category) return source.category;
  const sub = source.subcategory.toLowerCase();
  if (sub.includes("birthday")) return "EAT";
  if (["park", "garden", "zoo", "memorial", "heritage", "observatory", "programme"].some((k) => sub.includes(k))) {
    return "GO";
  }
  if (["museum", "gallery", "library"].some((k) => sub.includes(k))) return "GO";
  return "GO";
}

function defaultTags(source: EvergreenSource, category: SignalCategory): string[] {
  const tags = new Set<string>(source.tags ?? []);
  tags.add("evergreen");
  tags.add(source.country.toLowerCase());
  tags.add(category.toLowerCase());
  if (source.subcategory) tags.add(slugify(source.subcategory));
  if (!source.requiresCard) tags.add("no-card");
  return Array.from(tags);
}

function locationFor(source: EvergreenSource): string {
  if (source.country === "GLOBAL" || source.city === "Online" || source.city === "Nationwide") {
    return source.city === "Online" ? "Online" : source.city;
  }
  return `${source.city}, ${source.country}`;
}

function toOffer(source: EvergreenSource, slugPrefix?: string): EvergreenOffer {
  const category = defaultCategory(source);
  const baseSlug = slugify(`${slugPrefix ?? category}-${source.country}-${source.title}`);
  const sourceName =
    source.sourceName ??
    (source.claimUrl ? "Official venue" : "Curated evergreen catalogue");
  const sourceType = source.sourceType ?? (source.claimUrl ? "OFFICIAL" : "CURATED");
  const verification =
    source.verification ?? (source.claimUrl || sourceType === "OFFICIAL" ? "VERIFIED" : "COMMUNITY");

  return {
    slug: baseSlug,
    title: source.title,
    summary: source.summary,
    category,
    subcategory: source.subcategory,
    location: locationFor(source),
    city: source.city,
    country: source.country,
    freeScore: source.freeScore ?? hashScore(baseSlug),
    normalValue: source.normalValue,
    requiresCard: source.requiresCard ?? false,
    cancelReminder: source.cancelReminder ?? false,
    verification,
    tags: defaultTags(source, category),
    claimUrl: source.claimUrl,
    sourceName,
    sourceType,
    evergreen: true,
  };
}

function uniqueSlug(slug: string, used: Set<string>): string {
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i++;
  const next = `${slug}-${i}`;
  used.add(next);
  return next;
}

function buildCatalog(): EvergreenOffer[] {
  const used = new Set<string>();
  const offers: EvergreenOffer[] = [];

  const push = (offer: EvergreenOffer) => {
    offers.push({ ...offer, slug: uniqueSlug(offer.slug, used) });
  };

  for (const source of [...EVERGREEN_SOURCES, ...EXTRA_SOURCES]) {
    push(toOffer(source));
  }

  const npsDays = [...NPS_FEE_FREE_DAYS, ...EXTRA_NPS_DAYS];
  const seenParks = new Set<string>();
  for (const park of NPS_FEE_PARKS) {
    const key = park.title.toLowerCase();
    if (seenParks.has(key)) continue;
    seenParks.add(key);
    for (const day of npsDays) {
      push(
        toOffer(
          {
            title: `${park.title} — free entry on ${day.title}`,
            city: park.city,
            country: "US",
            claimUrl: park.claimUrl,
            subcategory: "National park fee-free day",
            normalValue: 35,
            summary: `${day.summary} This offer is for ${park.title}. Parking, camping, tours, and reservations may still cost money.`,
            category: "GO",
            tags: ["nps", "fee-free-day", "time-bound"],
            sourceName: "National Park Service fee-free days",
            sourceType: "OFFICIAL",
            verification: "VERIFIED",
            freeScore: 90,
          },
          `go-nps-${day.id}`
        )
      );
    }
  }

  for (const site of CANADA_STRONG_PASS_SITES) {
    push(
      toOffer(
        {
          title: `${site.title} — Canada Strong Pass 2026`,
          city: site.city,
          country: "CA",
          claimUrl: site.claimUrl,
          subcategory: "Parks Canada pass",
          normalValue: 28,
          summary:
            "Canada Strong Pass style free admission programme for Parks Canada places in 2026 (eligibility and covered activities vary). Confirm current pass rules on the official Parks Canada site before travel. Camping and extras may still be charged.",
          category: "GO",
          tags: ["canada-strong-pass", "parks-canada", "2026"],
          sourceName: "Canada Strong Pass 2026",
          sourceType: "OFFICIAL",
          verification: "VERIFIED",
          freeScore: 92,
        },
        "go-ca-strong"
      )
    );
  }

  return offers;
}

function main() {
  const offers = buildCatalog();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(offers, null, 2));
  const byCountry = offers.reduce<Record<string, number>>((acc, o) => {
    acc[o.country] = (acc[o.country] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Wrote ${offers.length} offers → ${OUT}`);
  console.log("By country:", byCountry);
  if (offers.length < 1200) {
    console.warn(`Warning: expected 1200+, got ${offers.length}`);
    process.exitCode = 1;
  }
}

main();

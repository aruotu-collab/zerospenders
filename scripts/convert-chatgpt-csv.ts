import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Convert the ChatGPT "Create Free Offers Dataset" CSV into ZeroSpenders JSON.
 *
 * Pipeline from the thread:
 *   candidate → check terms → verified → live → recheck → expired
 *
 * - publish_ready=YES → live board (VERIFIED)
 * - TRY FREE trials   → TRY board as COMMUNITY + cancel reminder
 * - remaining NO rows → COMMUNITY discovery (city leads + birthday)
 */

type Row = Record<string, string>;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSV_5000 = resolve(ROOT, "data/offers/sources/zerospenders_us_5000_free_offers.csv");
const CSV_500 = resolve(ROOT, "data/offers/sources/zerospenders_us_500_free_offers.csv");
const DEFAULT_CSV = existsSync(CSV_5000) ? CSV_5000 : CSV_500;

const CATEGORY_MAP: Record<string, string> = {
  "GET FREE": "GET",
  "GO FREE": "GO",
  "EAT FREE": "EAT",
  "LEARN FREE": "LEARN",
  "PLAY FREE": "PLAY",
  "TRY FREE": "TRY",
  "KIDS FREE": "KIDS",
  "ONLINE FREE": "ONLINE",
};

/** Typical paid-plan monthly value when ChatGPT left normal_value_usd blank. */
const TRIAL_VALUES: Record<string, number> = {
  "amazon prime": 15,
  "amazon music": 11,
  audible: 15,
  "kindle unlimited": 12,
  "apple music": 11,
  "apple tv": 10,
  "apple arcade": 7,
  "youtube premium": 14,
  "youtube music": 12,
  spotify: 12,
  siriusxm: 9,
  pandora: 11,
  tidal: 11,
  qobuz: 13,
  deezer: 11,
  hulu: 10,
  paramount: 8,
  peacock: 8,
  discovery: 7,
  fubo: 80,
  "youtube tv": 83,
  philo: 28,
  crunchyroll: 8,
  britbox: 9,
  mubi: 14,
  shudder: 7,
  scribd: 12,
  everand: 12,
  headspace: 13,
  calm: 15,
  strava: 12,
  peloton: 13,
  classpass: 19,
  adobe: 60,
  "microsoft 365": 10,
  linkedin: 40,
};

function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim()))
    .map((values) => {
      const out: Row = {};
      headers.forEach((header, i) => {
        out[header] = (values[i] || "").trim();
      });
      return out;
    });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function hashScore(seed: string, min: number, max: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return min + (h % (max - min + 1));
}

function cleanTitle(title: string) {
  return title
    .replace(/\s+[—–-]\s+Trial\s*\/\s*\$0 Intro/i, "")
    .replace(/\s+availability$/i, "")
    .replace(/\s+Trial\/credits check$/i, " trial")
    .trim();
}

function isTrial(row: Row) {
  return row.category === "TRY FREE" || /trial/i.test(row.offer_type);
}

function trialValue(row: Row) {
  const haystack = `${row.title} ${row.brand}`.toLowerCase();
  for (const [needle, value] of Object.entries(TRIAL_VALUES)) {
    if (haystack.includes(needle)) return value;
  }
  return 12;
}

function defaultValue(row: Row) {
  const parsed = Number(row.normal_value_usd);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  if (isTrial(row)) return trialValue(row);
  if (row.category === "GO FREE") return 18;
  if (row.category === "EAT FREE") return 8;
  if (row.category === "GET FREE") return 15;
  if (row.category === "LEARN FREE") return 20;
  if (row.category === "ONLINE FREE") return 12;
  if (row.category === "PLAY FREE") return 10;
  if (row.category === "KIDS FREE") return 10;
  return 10;
}

function cityFor(row: Row) {
  if (row.city) return row.city;
  if (row.online === "YES") return "Online";
  if (row.state) return row.state;
  return "United States";
}

function locationFor(row: Row, city: string) {
  if (city === "Online") return "Online";
  if (row.state && !city.includes(row.state)) return `${city}, ${row.state}`;
  return `${city}, US`;
}

function countryFor(row: Row) {
  if (row.location_scope === "Local") return row.country || "US";
  if (isTrial(row) || (row.online === "YES" && row.location_scope !== "Local")) {
    return "GLOBAL";
  }
  return row.country || "US";
}

function freeScore(row: Row, slug: string) {
  if (isTrial(row)) return hashScore(slug, 58, 72);
  if (row.publish_ready !== "YES") return hashScore(slug, 55, 72);
  if (row.offer_type.toLowerCase().includes("application")) return hashScore(slug, 70, 82);
  return hashScore(slug, 78, 96);
}

function summaryFor(row: Row) {
  const bits = [row.description, row.conditions].filter(Boolean);
  if (isTrial(row)) {
    bits.push("Usually needs a card and auto-renews. Set a cancel reminder before the trial ends.");
  }
  return bits.join(" ");
}

function toOffer(row: Row, verification: "VERIFIED" | "COMMUNITY") {
  const category = CATEGORY_MAP[row.category];
  if (!category) throw new Error(`Unknown category ${row.category}`);

  const trial = isTrial(row);
  const title = cleanTitle(row.title);
  const id = row.id.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const slug = `${trial ? "try" : "us"}-${id}-${slugify(title)}`;
  const city = cityFor(row);

  return {
    slug,
    title,
    summary: summaryFor(row),
    category,
    subcategory: trial ? "Free trial" : row.subcategory || row.offer_type,
    location: locationFor(row, city),
    city,
    country: countryFor(row),
    freeScore: freeScore(row, slug),
    normalValue: defaultValue(row),
    requiresCard: row.requires_card === "Yes" || trial,
    cancelReminder: trial,
    verification,
    tags: [
      row.brand,
      row.offer_type,
      trial ? "trial" : row.publish_ready === "YES" ? "chatgpt-us-500" : "discovery",
      trial ? "cancel-reminder" : null,
      row.city || null,
    ].filter(Boolean),
    claimUrl: row.source_url || null,
    sourceName: row.brand || "ChatGPT US seed",
    sourceType: trial
      ? "CHATGPT_CANDIDATE"
      : row.publish_ready === "YES"
        ? "CHATGPT_VERIFIED"
        : "CHATGPT_DISCOVERY",
    evergreen: !trial,
  };
}

const input = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_CSV;
const rows = parseCsv(readFileSync(input, "utf8"));
const outDir = resolve(ROOT, "data/offers");
mkdirSync(outDir, { recursive: true });

const live = rows
  .filter((row) => row.publish_ready === "YES")
  .map((row) => toOffer(row, /verified/i.test(row.verification_status) ? "VERIFIED" : "COMMUNITY"));

const trials = rows.filter((row) => row.category === "TRY FREE").map((row) => toOffer(row, "COMMUNITY"));

const discovery = rows
  .filter((row) => row.publish_ready !== "YES" && row.category !== "TRY FREE")
  .map((row) => toOffer(row, "COMMUNITY"));

writeFileSync(resolve(outDir, "us-chatgpt-verified.json"), `${JSON.stringify(live, null, 2)}\n`);
writeFileSync(resolve(outDir, "us-chatgpt-trials.json"), `${JSON.stringify(trials, null, 2)}\n`);
writeFileSync(resolve(outDir, "us-chatgpt-discovery.json"), `${JSON.stringify(discovery, null, 2)}\n`);

console.log(`CSV: ${input}`);
console.log(`Wrote ${live.length} publish-ready offers → data/offers/us-chatgpt-verified.json`);
console.log(`Wrote ${trials.length} free trials → data/offers/us-chatgpt-trials.json`);
console.log(`Wrote ${discovery.length} discovery/community offers → data/offers/us-chatgpt-discovery.json`);

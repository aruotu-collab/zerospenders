import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, type Prisma, type SignalCategory, type VerificationLevel } from "@prisma/client";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file: string) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

type OfferJson = {
  slug: string;
  title: string;
  summary: string;
  category: SignalCategory;
  subcategory: string;
  location: string;
  city: string;
  country: string;
  freeScore: number;
  normalValue: number;
  requiresCard: boolean;
  cancelReminder: boolean;
  verification: VerificationLevel;
  tags: string[];
  claimUrl: string | null;
  claimPhone?: string | null;
  claimEmail?: string | null;
  howToClaim?: string | null;
  sourceName: string;
  sourceType: string;
  evergreen: boolean;
};

const prisma = new PrismaClient();

function readOfferFiles(): OfferJson[] {
  const dir = resolve(ROOT, "data/offers");
  if (!existsSync(dir)) {
    throw new Error(`Missing offers directory: ${dir}. Run generate-evergreen-catalog first.`);
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const offers: OfferJson[] = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(resolve(dir, file), "utf8")) as OfferJson[];
    if (!Array.isArray(raw)) {
      throw new Error(`${file} must be a JSON array`);
    }
    offers.push(...raw);
  }
  return offers;
}

async function upsertOffer(offer: OfferJson) {
  const data: Prisma.SignalUncheckedCreateInput = {
    slug: offer.slug,
    title: offer.title,
    summary: offer.summary,
    category: offer.category,
    subcategory: offer.subcategory,
    location: offer.location,
    city: offer.city,
    country: offer.country,
    freeScore: offer.freeScore,
    normalValue: offer.normalValue,
    requiresCard: offer.requiresCard,
    cancelReminder: offer.cancelReminder,
    verification: offer.verification === "EXCLUSIVE" ? "EXCLUSIVE" : offer.verification,
    tags: offer.tags ?? [],
    claimUrl: offer.claimUrl,
    claimPhone: offer.claimPhone ?? null,
    claimEmail: offer.claimEmail ?? null,
    howToClaim:
      offer.howToClaim ??
      (offer.claimUrl
        ? "1. Open the official page linked on this signal.\n2. Follow their free entry / signup / rewards steps.\n3. Bring confirmation if the venue asks for it."
        : null),
    sourceName: offer.sourceName,
    sourceType: offer.sourceType,
    evergreen: offer.evergreen ?? true,
    active: true,
    status: "LIVE",
    successRate: 92,
  };

  await prisma.signal.upsert({
    where: { slug: offer.slug },
    create: data,
    update: {
      title: data.title,
      summary: data.summary,
      category: data.category,
      subcategory: data.subcategory,
      location: data.location,
      city: data.city,
      country: data.country,
      freeScore: data.freeScore,
      normalValue: data.normalValue,
      requiresCard: data.requiresCard,
      cancelReminder: data.cancelReminder,
      verification: data.verification,
      tags: data.tags,
      claimUrl: data.claimUrl,
      claimPhone: data.claimPhone,
      claimEmail: data.claimEmail,
      howToClaim: data.howToClaim,
      sourceName: data.sourceName,
      sourceType: data.sourceType,
      evergreen: data.evergreen,
      active: true,
      status: "LIVE",
    },
  });
}

async function refreshMetrics() {
  const [liveFreebies, valueAgg, verifiedCount] = await Promise.all([
    prisma.signal.count({ where: { active: true } }),
    prisma.signal.aggregate({
      where: { active: true },
      _sum: { normalValue: true },
    }),
    prisma.signal.count({
      where: { active: true, verification: "VERIFIED" },
    }),
  ]);

  const verifiedPct =
    liveFreebies === 0 ? 0 : Math.round((verifiedCount / liveFreebies) * 100);

  await prisma.platformMetric.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      liveFreebies,
      valueAvailable: valueAgg._sum.normalValue ?? 0,
      verifiedPct,
    },
    update: {
      liveFreebies,
      valueAvailable: valueAgg._sum.normalValue ?? 0,
      verifiedPct,
    },
  });

  return { liveFreebies, valueAvailable: valueAgg._sum.normalValue ?? 0, verifiedPct };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to .env before importing.");
  }

  const offers = readOfferFiles();
  console.log(`Importing ${offers.length} offers from data/offers/*.json …`);

  const batchSize = 50;
  for (let i = 0; i < offers.length; i += batchSize) {
    const batch = offers.slice(i, i + batchSize);
    await Promise.all(batch.map((offer) => upsertOffer(offer)));
    if ((i + batch.length) % 200 === 0 || i + batch.length >= offers.length) {
      console.log(`  upserted ${Math.min(i + batch.length, offers.length)} / ${offers.length}`);
    }
  }

  const metrics = await refreshMetrics();
  console.log("PlatformMetric updated:", metrics);
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

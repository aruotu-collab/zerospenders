import type { PrismaClient } from "@prisma/client";
import { fetchEventbriteCandidates } from "@/lib/discovery/connectors/eventbrite";
import { fetchRedditCandidates } from "@/lib/discovery/connectors/reddit";
import { fetchRssCandidates } from "@/lib/discovery/connectors/rss";
import type { DiscoveryStats, RawCandidate } from "@/lib/discovery/types";
import { slugifyOffer, verifyClaimUrl } from "@/lib/discovery/verify-offer";

const AUTO_PUBLISH_SCORE = 90;

async function uniqueSignalSlug(prisma: PrismaClient, base: string) {
  let slug = base || `offer-${Date.now()}`;
  let i = 2;
  while (await prisma.signal.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

async function alreadyKnown(prisma: PrismaClient, candidate: RawCandidate) {
  const [byExternal, byUrlSignal, byUrlSubmission] = await Promise.all([
    prisma.offerSubmission.findUnique({
      where: {
        source_externalId: {
          source: candidate.source,
          externalId: candidate.externalId,
        },
      },
      select: { id: true },
    }),
    prisma.signal.findFirst({
      where: { claimUrl: candidate.claimUrl },
      select: { id: true },
    }),
    prisma.offerSubmission.findFirst({
      where: { claimUrl: candidate.claimUrl, status: { in: ["PENDING", "APPROVED"] } },
      select: { id: true },
    }),
  ]);
  return Boolean(byExternal || byUrlSignal || byUrlSubmission);
}

async function publishCandidate(
  prisma: PrismaClient,
  candidate: RawCandidate,
  autoScore: number
) {
  const baseSlug = slugifyOffer(
    `${candidate.category}-${candidate.country}-${candidate.title}`
  );
  const slug = await uniqueSignalSlug(prisma, baseSlug);

  await prisma.signal.create({
    data: {
      slug,
      title: candidate.title,
      summary: candidate.summary,
      category: candidate.category,
      subcategory: `Auto · ${candidate.source}`,
      location: candidate.location,
      city: candidate.city,
      country: candidate.country,
      freeScore: autoScore,
      normalValue: candidate.normalValue,
      verification: candidate.source === "eventbrite" ? "VERIFIED" : "COMMUNITY",
      status: "NEW",
      claimUrl: candidate.claimUrl,
      howToClaim: candidate.howToClaim,
      sourceName: `Daily discovery · ${candidate.source}`,
      sourceType: "CRON",
      evergreen: false,
      active: true,
      tags: ["auto-discovery", candidate.source, candidate.country.toLowerCase()],
      updates: {
        create: {
          text: `Auto-published from ${candidate.source} daily scan (score ${autoScore}).`,
        },
      },
    },
  });
}

async function queueCandidate(
  prisma: PrismaClient,
  candidate: RawCandidate,
  autoScore: number
) {
  await prisma.offerSubmission.create({
    data: {
      title: candidate.title,
      summary: candidate.summary,
      category: candidate.category,
      country: candidate.country,
      city: candidate.city,
      location: candidate.location,
      claimUrl: candidate.claimUrl,
      howToClaim: candidate.howToClaim,
      normalValue: candidate.normalValue,
      status: "PENDING",
      source: candidate.source,
      externalId: candidate.externalId,
      autoScore,
      notes: `Auto-discovered · score ${autoScore}`,
    },
  });
}

export async function runDailyDiscovery(prisma: PrismaClient): Promise<DiscoveryStats> {
  const stats: DiscoveryStats = {
    found: 0,
    queued: 0,
    published: 0,
    skipped: 0,
    errors: [],
    sources: {},
  };

  const [eventbrite, reddit, rss] = await Promise.all([
    fetchEventbriteCandidates().catch((e) => {
      stats.errors.push(`eventbrite: ${e instanceof Error ? e.message : "failed"}`);
      return [] as RawCandidate[];
    }),
    fetchRedditCandidates().catch((e) => {
      stats.errors.push(`reddit: ${e instanceof Error ? e.message : "failed"}`);
      return [] as RawCandidate[];
    }),
    fetchRssCandidates().catch((e) => {
      stats.errors.push(`rss: ${e instanceof Error ? e.message : "failed"}`);
      return [] as RawCandidate[];
    }),
  ]);

  const candidates = [...eventbrite, ...reddit, ...rss];
  stats.found = candidates.length;

  for (const c of candidates) {
    stats.sources[c.source] = (stats.sources[c.source] ?? 0) + 1;
  }

  for (const candidate of candidates) {
    try {
      if (await alreadyKnown(prisma, candidate)) {
        stats.skipped += 1;
        continue;
      }

      const check = await verifyClaimUrl(candidate.claimUrl, candidate.title, candidate.summary);
      if (!check.ok) {
        stats.skipped += 1;
        continue;
      }

      const autoScore = check.score;
      const canAutoPublish =
        autoScore >= AUTO_PUBLISH_SCORE &&
        (candidate.source === "eventbrite" || candidate.source === "rss");

      if (canAutoPublish) {
        await publishCandidate(prisma, candidate, autoScore);
        stats.published += 1;
      } else if (autoScore >= 60) {
        await queueCandidate(prisma, candidate, autoScore);
        stats.queued += 1;
      } else {
        stats.skipped += 1;
      }
    } catch (err) {
      stats.errors.push(
        `${candidate.source}/${candidate.externalId}: ${err instanceof Error ? err.message : "error"}`
      );
      stats.skipped += 1;
    }
  }

  await prisma.discoveryRun.create({
    data: {
      kind: "discover",
      found: stats.found,
      queued: stats.queued,
      published: stats.published,
      skipped: stats.skipped,
      detail: JSON.stringify({ sources: stats.sources, errors: stats.errors }),
    },
  });

  if (stats.queued > 0 || stats.published > 0) {
    await prisma.activityEvent.create({
      data: {
        text: `Daily discovery: ${stats.published} published, ${stats.queued} queued for review (${stats.found} scanned).`,
      },
    });
  }

  return stats;
}

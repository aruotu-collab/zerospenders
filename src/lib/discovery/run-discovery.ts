import type { PrismaClient } from "@prisma/client";
import { fetchEventbriteCandidates } from "@/lib/discovery/connectors/eventbrite";
import { fetchRedditCandidates } from "@/lib/discovery/connectors/reddit";
import { fetchRssCandidates } from "@/lib/discovery/connectors/rss";
import type { DiscoveryStats, RawCandidate } from "@/lib/discovery/types";
import { slugifyOffer, verifyClaimUrl } from "@/lib/discovery/verify-offer";

/** Verified candidates at this score go live immediately (no admin wait). */
const AUTO_PUBLISH_SCORE = 60;

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
  const [byExternal, byUrlSignal] = await Promise.all([
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
  ]);
  return Boolean(byExternal || byUrlSignal);
}

async function refreshMetrics(prisma: PrismaClient) {
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

  await prisma.$transaction([
    prisma.signal.create({
      data: {
        slug,
        title: candidate.title,
        summary: candidate.summary,
        category: candidate.category,
        subcategory: `Auto · ${candidate.source}`,
        location: candidate.location,
        city: candidate.city,
        country: candidate.country,
        freeScore: Math.max(autoScore, 70),
        normalValue: candidate.normalValue,
        verification: candidate.source === "eventbrite" ? "VERIFIED" : "COMMUNITY",
        status: "NEW",
        claimUrl: candidate.claimUrl,
        howToClaim: candidate.howToClaim,
        sourceName: `Auto discovery · ${candidate.source}`,
        sourceType: "CRON",
        evergreen: false,
        active: true,
        tags: ["auto-discovery", "live", candidate.source, candidate.country.toLowerCase()],
        updates: {
          create: {
            text: `Auto-published live from ${candidate.source} (score ${autoScore}).`,
          },
        },
      },
    }),
    prisma.offerSubmission.create({
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
        status: "APPROVED",
        source: candidate.source,
        externalId: candidate.externalId,
        autoScore,
        notes: `Auto-published live as /signals/${slug}`,
      },
    }),
  ]);

  return slug;
}

/** Publish any older PENDING auto-finds that were waiting for admin review. */
async function flushPendingAutoFinds(prisma: PrismaClient) {
  const pending = await prisma.offerSubmission.findMany({
    where: {
      status: "PENDING",
      source: { not: "hunter" },
    },
    take: 100,
  });

  let published = 0;
  for (const submission of pending) {
    if (!submission.claimUrl) {
      await prisma.offerSubmission.update({
        where: { id: submission.id },
        data: { status: "REJECTED", notes: "No claim URL — cannot auto-publish" },
      });
      continue;
    }

    const exists = await prisma.signal.findFirst({
      where: { claimUrl: submission.claimUrl },
      select: { id: true },
    });
    if (exists) {
      await prisma.offerSubmission.update({
        where: { id: submission.id },
        data: { status: "APPROVED", notes: "Already live — marked approved" },
      });
      continue;
    }

    const check = await verifyClaimUrl(
      submission.claimUrl,
      submission.title,
      submission.summary
    );
    if (!check.ok) {
      await prisma.offerSubmission.update({
        where: { id: submission.id },
        data: {
          status: "REJECTED",
          notes: `Auto-flush rejected: ${check.notes.join(", ") || "link check failed"}`,
        },
      });
      continue;
    }

    const candidate: RawCandidate = {
      source: submission.source as RawCandidate["source"],
      externalId: submission.externalId || submission.id,
      title: submission.title,
      summary: submission.summary,
      category: submission.category,
      country: submission.country,
      city: submission.city,
      location: submission.location,
      claimUrl: submission.claimUrl,
      howToClaim:
        submission.howToClaim ||
        "1. Open the official page.\n2. Follow the free claim steps.\n3. Confirm before travelling or signing up.",
      normalValue: submission.normalValue,
    };

    const baseSlug = slugifyOffer(
      `${candidate.category}-${candidate.country}-${candidate.title}`
    );
    const slug = await uniqueSignalSlug(prisma, baseSlug);

    await prisma.$transaction([
      prisma.signal.create({
        data: {
          slug,
          title: candidate.title,
          summary: candidate.summary,
          category: candidate.category,
          subcategory: `Auto · ${candidate.source}`,
          location: candidate.location,
          city: candidate.city,
          country: candidate.country,
          freeScore: Math.max(check.score, 70),
          normalValue: candidate.normalValue,
          verification: "COMMUNITY",
          status: "NEW",
          claimUrl: candidate.claimUrl,
          howToClaim: candidate.howToClaim,
          sourceName: `Auto discovery · ${candidate.source}`,
          sourceType: "CRON",
          evergreen: false,
          active: true,
          tags: ["auto-discovery", "live", candidate.source, candidate.country.toLowerCase()],
          updates: {
            create: {
              text: `Auto-published from pending queue (score ${check.score}).`,
            },
          },
        },
      }),
      prisma.offerSubmission.update({
        where: { id: submission.id },
        data: {
          status: "APPROVED",
          autoScore: check.score,
          notes: `Auto-published live as /signals/${slug}`,
        },
      }),
    ]);
    published += 1;
  }

  return published;
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

  // First: flush anything that was waiting in admin queue.
  try {
    stats.published += await flushPendingAutoFinds(prisma);
  } catch (err) {
    stats.errors.push(
      `flush: ${err instanceof Error ? err.message : "failed to flush pending"}`
    );
  }

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
      if (!check.ok || check.score < AUTO_PUBLISH_SCORE) {
        stats.skipped += 1;
        continue;
      }

      await publishCandidate(prisma, candidate, check.score);
      stats.published += 1;
    } catch (err) {
      stats.errors.push(
        `${candidate.source}/${candidate.externalId}: ${err instanceof Error ? err.message : "error"}`
      );
      stats.skipped += 1;
    }
  }

  if (stats.published > 0) {
    await refreshMetrics(prisma);
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

  if (stats.published > 0) {
    await prisma.activityEvent.create({
      data: {
        text: `Auto discovery published ${stats.published} FREE deal${stats.published === 1 ? "" : "s"} live (${stats.found} scanned).`,
      },
    });
  }

  return stats;
}

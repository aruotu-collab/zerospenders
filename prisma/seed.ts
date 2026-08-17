import { PrismaClient } from "@prisma/client";
import { SIGNALS, CREATOR_DROPS, ACTIVITY, PULSE } from "../src/lib/data";

const prisma = new PrismaClient();

const categoryMap = {
  get: "GET",
  go: "GO",
  eat: "EAT",
  learn: "LEARN",
  play: "PLAY",
  try: "TRY",
  kids: "KIDS",
  online: "ONLINE",
} as const;

const verificationMap = {
  verified: "VERIFIED",
  community: "COMMUNITY",
  exclusive: "EXCLUSIVE",
} as const;

const statusMap = {
  live: "LIVE",
  ending: "ENDING",
  new: "NEW",
} as const;

async function main() {
  console.log("Seeding ZeroSpenders…");

  await prisma.dropApplication.deleteMany();
  await prisma.cancelReminder.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.watch.deleteMany();
  await prisma.signalUpdate.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.creatorDrop.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.platformMetric.deleteMany();

  for (const signal of SIGNALS) {
    const created = await prisma.signal.create({
      data: {
        slug: signal.id,
        title: signal.title,
        summary: signal.summary,
        category: categoryMap[signal.category],
        subcategory: signal.subcategory,
        location: signal.location,
        city: signal.city,
        country: signal.country || "GB",
        distanceMiles: signal.distanceMiles,
        freeScore: signal.freeScore,
        normalValue: signal.normalValue,
        claimsCount: signal.claims,
        watchingCount: signal.watching,
        remaining: signal.remaining,
        successRate: signal.successRate,
        verifiedAt: new Date(Date.now() - signal.verifiedMinsAgo * 60_000),
        requiresCard: signal.requiresCard,
        cancelReminder: signal.cancelReminder,
        verification: verificationMap[signal.verification],
        status: statusMap[signal.status],
        endsAt:
          signal.endsInHours !== undefined
            ? new Date(Date.now() + signal.endsInHours * 3600_000)
            : null,
        droppedAt:
          signal.droppedMinsAgo !== undefined
            ? new Date(Date.now() - signal.droppedMinsAgo * 60_000)
            : null,
        activityDelta: signal.activityDelta,
        workedFor: signal.workedFor,
        didntWork: signal.didntWork,
        tags: signal.tags,
        sponsored: !!signal.sponsored,
        claimUrl: null,
      },
    });

    if (signal.updates.length) {
      await prisma.signalUpdate.createMany({
        data: signal.updates.map((u, index) => ({
          signalId: created.id,
          text: u.text,
          createdAt: new Date(Date.now() - (signal.updates.length - index) * 15 * 60_000),
        })),
      });
    }
  }

  for (const drop of CREATOR_DROPS) {
    await prisma.creatorDrop.create({
      data: {
        slug: drop.id,
        title: drop.title,
        brandName: drop.brand,
        retailValue: drop.retailValue,
        available: drop.available,
        appliedCount: drop.applied,
        selectedCount: drop.selected,
        closesAt: new Date(Date.now() + drop.closesInHours * 3600_000),
        missionType: drop.missionType,
        category: drop.category,
        requirements: drop.requirements,
      },
    });
  }

  await prisma.activityEvent.createMany({
    data: ACTIVITY.map((item, index) => ({
      text: item.text,
      createdAt: new Date(Date.now() - index * 60_000),
    })),
  });

  await prisma.platformMetric.create({
    data: {
      id: "global",
      liveFreebies: PULSE.liveFreebies,
      valueAvailable: PULSE.valueAvailable,
      claimsToday: PULSE.claimsToday,
      newToday: PULSE.newToday,
      endingSoon: PULSE.endingSoon,
      verifiedPct: PULSE.verifiedPct,
      peopleWatching: PULSE.peopleWatching,
    },
  });

  console.log(`Seeded ${SIGNALS.length} signals, ${CREATOR_DROPS.length} drops.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

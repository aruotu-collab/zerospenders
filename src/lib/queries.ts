import { prisma } from "@/lib/db";
import { mapActivity, mapDrop, mapPulse, mapSignal } from "@/lib/mappers";
import type { SignalCategory } from "@/lib/types";
import { CITY_HEAT, TICKER_ITEMS } from "@/lib/data";

const categoryToDb = {
  get: "GET",
  go: "GO",
  eat: "EAT",
  learn: "LEARN",
  play: "PLAY",
  try: "TRY",
  kids: "KIDS",
  online: "ONLINE",
} as const;

export async function getPulse() {
  const metric = await prisma.platformMetric.findUnique({ where: { id: "global" } });
  if (!metric) {
    return {
      liveFreebies: 0,
      valueAvailable: 0,
      claimsToday: 0,
      newToday: 0,
      endingSoon: 0,
      verifiedPct: 0,
      peopleWatching: 0,
    };
  }
  return mapPulse(metric);
}

export async function listSignals(opts?: { category?: SignalCategory; nearOnly?: boolean }) {
  const signals = await prisma.signal.findMany({
    where: {
      active: true,
      ...(opts?.category ? { category: categoryToDb[opts.category] } : {}),
      ...(opts?.nearOnly ? { distanceMiles: { not: null } } : {}),
    },
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 6 },
    },
    orderBy: [{ freeScore: "desc" }, { updatedAt: "desc" }],
  });
  return signals.map(mapSignal);
}

export async function getSignalBySlug(slug: string) {
  const signal = await prisma.signal.findUnique({
    where: { slug },
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  return signal ? mapSignal(signal) : null;
}

export async function listCreatorDrops() {
  const drops = await prisma.creatorDrop.findMany({
    where: { active: true },
    orderBy: { closesAt: "asc" },
  });
  return drops.map(mapDrop);
}

export async function listActivity(limit = 12) {
  const events = await prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return events.map(mapActivity);
}

export async function getBoardBundles() {
  const [all, pulse, activity, drops] = await Promise.all([
    listSignals(),
    getPulse(),
    listActivity(),
    listCreatorDrops(),
  ]);

  const trending = [...all]
    .sort((a, b) => (b.activityDelta ?? b.claims) - (a.activityDelta ?? a.claims))
    .slice(0, 5);
  const dropped = all
    .filter((s) => s.status === "new" || (s.droppedMinsAgo ?? 999) < 60)
    .sort((a, b) => (a.droppedMinsAgo ?? 999) - (b.droppedMinsAgo ?? 999))
    .slice(0, 5);
  const ending = all
    .filter((s) => s.status === "ending" || (s.remaining !== undefined && s.remaining < 30))
    .sort((a, b) => (a.endsInHours ?? 99) - (b.endsInHours ?? 99))
    .slice(0, 5);
  const near = all
    .filter((s) => s.distanceMiles !== undefined)
    .sort((a, b) => (a.distanceMiles ?? 99) - (b.distanceMiles ?? 99));

  return {
    signals: all,
    trending,
    dropped,
    ending,
    near,
    pulse,
    activity,
    drops,
    cityHeat: CITY_HEAT,
    ticker: TICKER_ITEMS,
  };
}

export { prisma };

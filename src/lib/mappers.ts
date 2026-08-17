import type {
  Signal as DbSignal,
  SignalCategory as DbCategory,
  SignalStatus as DbStatus,
  VerificationLevel as DbVerification,
  CreatorDrop as DbDrop,
  PlatformMetric,
  ActivityEvent,
} from "@prisma/client";
import type {
  FreeSignal,
  SignalCategory,
  VerificationLevel,
  CreatorDrop,
  ActivityItem,
  PulseMetrics,
} from "@/lib/types";

const categoryMap: Record<DbCategory, SignalCategory> = {
  GET: "get",
  GO: "go",
  EAT: "eat",
  LEARN: "learn",
  PLAY: "play",
  TRY: "try",
  KIDS: "kids",
  ONLINE: "online",
};

const verificationMap: Record<DbVerification, VerificationLevel> = {
  VERIFIED: "verified",
  COMMUNITY: "community",
  EXCLUSIVE: "exclusive",
};

const statusMap: Record<DbStatus, FreeSignal["status"]> = {
  LIVE: "live",
  ENDING: "ending",
  NEW: "new",
};

export function mapSignal(
  signal: DbSignal & { updates?: { createdAt: Date; text: string }[] }
): FreeSignal {
  const verifiedMinsAgo = Math.max(
    0,
    Math.round((Date.now() - signal.verifiedAt.getTime()) / 60000)
  );
  const droppedMinsAgo = signal.droppedAt
    ? Math.max(0, Math.round((Date.now() - signal.droppedAt.getTime()) / 60000))
    : undefined;
  const endsInHours = signal.endsAt
    ? Math.max(0, (signal.endsAt.getTime() - Date.now()) / 3600000)
    : undefined;

  return {
    id: signal.slug,
    title: signal.title,
    summary: signal.summary,
    category: categoryMap[signal.category],
    subcategory: signal.subcategory,
    location: signal.location,
    country: signal.country || "GB",
    distanceMiles: signal.distanceMiles ?? undefined,
    freeScore: signal.freeScore,
    normalValue: signal.normalValue,
    claims: signal.claimsCount,
    watching: signal.watchingCount,
    remaining: signal.remaining ?? undefined,
    successRate: signal.successRate,
    verifiedMinsAgo,
    requiresCard: signal.requiresCard,
    cancelReminder: signal.cancelReminder,
    verification: verificationMap[signal.verification],
    status: statusMap[signal.status],
    endsInHours,
    droppedMinsAgo,
    activityDelta: signal.activityDelta ?? undefined,
    city: signal.city,
    workedFor: signal.workedFor,
    didntWork: signal.didntWork,
    updates: (signal.updates ?? []).map((u) => ({
      time: u.createdAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: u.text,
    })),
    tags: signal.tags,
    sponsored: signal.sponsored || undefined,
    claimUrl: signal.claimUrl ?? undefined,
  };
}

export function mapDrop(drop: DbDrop): CreatorDrop {
  const closesInHours = Math.max(0, (drop.closesAt.getTime() - Date.now()) / 3600000);
  return {
    id: drop.slug,
    title: drop.title,
    brand: drop.brandName,
    retailValue: drop.retailValue,
    available: drop.available,
    applied: drop.appliedCount,
    selected: drop.selectedCount,
    closesInHours,
    matchScore: 80,
    requirements: drop.requirements,
    missionType: drop.missionType,
    category: drop.category,
  };
}

export function mapActivity(event: ActivityEvent): ActivityItem {
  return {
    id: event.id,
    text: event.text,
    minsAgo: Math.max(0, Math.round((Date.now() - event.createdAt.getTime()) / 60000)),
  };
}

export function mapPulse(metric: PlatformMetric): PulseMetrics {
  return {
    liveFreebies: metric.liveFreebies,
    valueAvailable: metric.valueAvailable,
    claimsToday: metric.claimsToday,
    newToday: metric.newToday,
    endingSoon: metric.endingSoon,
    verifiedPct: metric.verifiedPct,
    peopleWatching: metric.peopleWatching,
  };
}

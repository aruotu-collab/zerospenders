import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

function sinceDays(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getAdminStats(days = 30) {
  const since = sinceDays(days);

  const [
    memberCount,
    membersByRole,
    members,
    visitCount,
    clickCount,
    uniqueIps,
    topClicks,
    topPaths,
    topSources,
    recentVisits,
    recentClicks,
    pendingSubmissions,
    discoveryRuns,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        postcode: true,
        radiusMiles: true,
        interests: true,
        savedGBP: true,
        hunterLevel: true,
        createdAt: true,
        _count: {
          select: {
            claims: true,
            watches: true,
            reminders: true,
            offerSubmissions: true,
          },
        },
      },
    }),
    prisma.siteVisit.count({ where: { createdAt: { gte: since } } }),
    prisma.siteClick.count({ where: { createdAt: { gte: since } } }),
    prisma.siteVisit.findMany({
      where: { createdAt: { gte: since }, ip: { not: null } },
      distinct: ["ip"],
      select: { ip: true },
      take: 5000,
    }),
    prisma.siteClick.groupBy({
      by: ["targetLabel", "targetType", "targetId"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { targetLabel: "desc" } },
      take: 25,
    }),
    prisma.siteVisit.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 20,
    }),
    prisma.siteVisit.groupBy({
      by: ["source"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 20,
    }),
    prisma.siteVisit.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        path: true,
        referrer: true,
        source: true,
        ip: true,
        country: true,
        createdAt: true,
      },
    }),
    prisma.siteClick.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        path: true,
        targetType: true,
        targetLabel: true,
        targetId: true,
        href: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.offerSubmission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.discoveryRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 14,
    }),
  ]);

  // Unique IPs with visit counts (top recent)
  const ipRows = await prisma.$queryRaw<
    { ip: string; visits: number; last_seen: Date; source: string | null }[]
  >(Prisma.sql`
    SELECT ip, COUNT(*)::int AS visits, MAX("createdAt") AS last_seen,
           (ARRAY_AGG(source ORDER BY "createdAt" DESC))[1] AS source
    FROM "SiteVisit"
    WHERE "createdAt" >= ${since} AND ip IS NOT NULL
    GROUP BY ip
    ORDER BY visits DESC, last_seen DESC
    LIMIT 40
  `);

  return {
    days,
    memberCount,
    membersByRole: Object.fromEntries(membersByRole.map((r) => [r.role, r._count._all])),
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      postcode: m.postcode,
      radiusMiles: m.radiusMiles,
      interests: m.interests,
      savedGBP: m.savedGBP,
      hunterLevel: m.hunterLevel,
      createdAt: m.createdAt,
      claims: m._count.claims,
      watches: m._count.watches,
      reminders: m._count.reminders,
      submissions: m._count.offerSubmissions,
    })),
    visitCount,
    clickCount,
    uniqueIpCount: uniqueIps.length,
    topClicks: topClicks.map((row) => ({
      label: row.targetLabel || row.targetId || row.targetType,
      type: row.targetType,
      id: row.targetId,
      count: row._count._all,
    })),
    topPaths: topPaths.map((row) => ({ path: row.path, count: row._count._all })),
    topSources: topSources.map((row) => ({
      source: row.source || "direct",
      count: row._count._all,
    })),
    recentVisits,
    recentClicks,
    topIps: ipRows.map((row) => ({
      ip: row.ip,
      visits: row.visits,
      lastSeen: row.last_seen,
      source: row.source || "direct",
    })),
    pendingSubmissions: pendingSubmissions.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      category: s.category,
      country: s.country,
      city: s.city,
      claimUrl: s.claimUrl,
      claimPhone: s.claimPhone,
      claimEmail: s.claimEmail,
      howToClaim: s.howToClaim,
      normalValue: s.normalValue,
      source: s.source,
      autoScore: s.autoScore,
      createdAt: s.createdAt,
      hunter:
        s.source === "hunter"
          ? s.user?.name || s.user?.email || "Hunter"
          : `Auto · ${s.source}`,
    })),
    discoveryRuns: discoveryRuns.map((r) => ({
      id: r.id,
      kind: r.kind,
      found: r.found,
      queued: r.queued,
      published: r.published,
      skipped: r.skipped,
      createdAt: r.createdAt,
    })),
  };
}

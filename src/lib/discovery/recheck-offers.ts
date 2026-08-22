import type { PrismaClient } from "@prisma/client";
import { verifyClaimUrl } from "@/lib/discovery/verify-offer";

export type RecheckStats = {
  checked: number;
  expired: number;
  ok: number;
  errors: string[];
};

export async function runOfferRecheck(prisma: PrismaClient): Promise<RecheckStats> {
  const stats: RecheckStats = { checked: 0, expired: 0, ok: 0, errors: [] };

  const signals = await prisma.signal.findMany({
    where: {
      active: true,
      claimUrl: { not: null },
    },
    orderBy: { verifiedAt: "asc" },
    take: 150,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      claimUrl: true,
    },
  });

  for (const signal of signals) {
    if (!signal.claimUrl) continue;
    stats.checked += 1;

    try {
      const check = await verifyClaimUrl(signal.claimUrl, signal.title, signal.summary);
      if (check.ok) {
        await prisma.signal.update({
          where: { id: signal.id },
          data: { verifiedAt: new Date() },
        });
        stats.ok += 1;
        continue;
      }

      await prisma.$transaction([
        prisma.signal.update({
          where: { id: signal.id },
          data: { active: false, status: "ENDING" },
        }),
        prisma.signalUpdate.create({
          data: {
            signalId: signal.id,
            text: `Auto-recheck flagged this offer (${check.notes.join(", ") || "link may be dead"}).`,
          },
        }),
      ]);
      stats.expired += 1;
    } catch (err) {
      stats.errors.push(
        `${signal.slug}: ${err instanceof Error ? err.message : "recheck failed"}`
      );
    }
  }

  await prisma.discoveryRun.create({
    data: {
      kind: "recheck",
      found: stats.checked,
      queued: 0,
      published: stats.ok,
      skipped: stats.expired,
      detail: JSON.stringify({ errors: stats.errors }),
    },
  });

  return stats;
}

import type { PrismaClient, SignalCategory } from "@prisma/client";
import {
  buildNewOffersDigestEmail,
  emailConfigured,
  sendEmail,
} from "@/lib/email";
import { matchOffersToInterests, type NewOffer } from "@/lib/interests";

export type NotifyStats = {
  membersChecked: number;
  emailsSent: number;
  emailsSkipped: number;
  errors: string[];
};

export async function notifyMembersOfNewOffers(
  prisma: PrismaClient,
  publishedIds: string[]
): Promise<NotifyStats> {
  const stats: NotifyStats = {
    membersChecked: 0,
    emailsSent: 0,
    emailsSkipped: 0,
    errors: [],
  };

  if (!publishedIds.length) return stats;

  if (!emailConfigured()) {
    stats.errors.push("Email not configured (set RESEND_API_KEY + EMAIL_FROM)");
    return stats;
  }

  const signals = await prisma.signal.findMany({
    where: { id: { in: publishedIds }, active: true },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      tags: true,
      country: true,
    },
  });

  if (!signals.length) return stats;

  const offers: NewOffer[] = signals.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    category: s.category as SignalCategory,
    tags: s.tags,
    country: s.country,
  }));

  const members = await prisma.user.findMany({
    where: { emailOptIn: true },
    select: {
      id: true,
      name: true,
      email: true,
      interests: true,
    },
  });

  for (const member of members) {
    stats.membersChecked += 1;

    if (!member.interests.length) {
      stats.emailsSkipped += 1;
      continue;
    }

    const buckets = matchOffersToInterests(member.interests, offers);
    if (!buckets.length) {
      stats.emailsSkipped += 1;
      continue;
    }

    // Deduplicate offers counted across overlapping interests for the total.
    const uniqueIds = new Set(buckets.flatMap((b) => b.offers.map((o) => o.id)));
    const total = uniqueIds.size;
    const digest = buildNewOffersDigestEmail({
      name: member.name || "hunter",
      buckets: buckets.map((b) => ({ label: b.label, count: b.count })),
      total,
    });

    const result = await sendEmail({
      to: member.email,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    });

    if (result.ok) {
      stats.emailsSent += 1;
      await prisma.digestSend.create({
        data: {
          userId: member.id,
          email: member.email,
          offerCount: total,
          interests: buckets.map((b) => `${b.label}:${b.count}`),
          providerId: result.id ?? null,
        },
      });
    } else {
      stats.errors.push(`${member.email}: ${result.error}`);
    }
  }

  return stats;
}

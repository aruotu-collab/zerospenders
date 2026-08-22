"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { AuthError } from "next-auth";
import type { Role } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  postcode: z.string().min(2).optional(),
  role: z.enum(["MEMBER", "CREATOR", "BRAND"]).default("MEMBER"),
  interests: z.array(z.string()).default([]),
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const role = data.role as Role;

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      role,
      postcode: data.postcode,
      interests: data.interests,
      hunterLevel: "Freebie Rookie",
      ...(role === "CREATOR"
        ? {
            creatorProfile: {
              create: {
                displayName: data.name,
                platforms: ["TikTok", "Instagram"],
              },
            },
          }
        : {}),
      ...(role === "BRAND"
        ? {
            brandProfile: {
              create: {
                company: data.name,
              },
            },
          }
        : {}),
    },
  });

  await prisma.activityEvent.create({
    data: {
      text: `${user.name ?? "Someone"} just joined ZeroSpenders`,
      userId: user.id,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: true as const, userId: user.id, signedIn: false };
    }
    throw error;
  }

  return { ok: true as const, userId: user.id, signedIn: true };
}

export async function loginUser(email: string, password: string) {
  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    return { ok: true as const };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    throw error;
  }
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

export async function toggleClaim(signalSlug: string) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, error: "auth_required" };

  const signal = await prisma.signal.findUnique({ where: { slug: signalSlug } });
  if (!signal) return { ok: false as const, error: "not_found" };

  const existing = await prisma.claim.findUnique({
    where: { userId_signalId: { userId, signalId: signal.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.claim.delete({ where: { id: existing.id } }),
      prisma.signal.update({
        where: { id: signal.id },
        data: { claimsCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true as const, claimed: false };
  }

  await prisma.$transaction([
    prisma.claim.create({ data: { userId, signalId: signal.id } }),
    prisma.signal.update({
      where: { id: signal.id },
      data: {
        claimsCount: { increment: 1 },
        remaining: signal.remaining !== null ? Math.max(0, signal.remaining - 1) : undefined,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { savedGBP: { increment: signal.normalValue } },
    }),
    prisma.activityEvent.create({
      data: {
        text: `Someone claimed ${signal.title}`,
        userId,
      },
    }),
    prisma.platformMetric.update({
      where: { id: "global" },
      data: { claimsToday: { increment: 1 } },
    }),
  ]);

  return { ok: true as const, claimed: true };
}

export async function toggleWatch(signalSlug: string) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, error: "auth_required" };

  const signal = await prisma.signal.findUnique({ where: { slug: signalSlug } });
  if (!signal) return { ok: false as const, error: "not_found" };

  const existing = await prisma.watch.findUnique({
    where: { userId_signalId: { userId, signalId: signal.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.watch.delete({ where: { id: existing.id } }),
      prisma.signal.update({
        where: { id: signal.id },
        data: { watchingCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true as const, watching: false };
  }

  await prisma.$transaction([
    prisma.watch.create({ data: { userId, signalId: signal.id } }),
    prisma.signal.update({
      where: { id: signal.id },
      data: { watchingCount: { increment: 1 } },
    }),
    prisma.platformMetric.update({
      where: { id: "global" },
      data: { peopleWatching: { increment: 1 } },
    }),
  ]);

  return { ok: true as const, watching: true };
}

export async function toggleReminder(signalSlug: string) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, error: "auth_required" };

  const signal = await prisma.signal.findUnique({ where: { slug: signalSlug } });
  if (!signal) return { ok: false as const, error: "not_found" };

  const existing = await prisma.cancelReminder.findUnique({
    where: { userId_signalId: { userId, signalId: signal.id } },
  });

  if (existing) {
    await prisma.cancelReminder.delete({ where: { id: existing.id } });
    return { ok: true as const, reminded: false };
  }

  await prisma.cancelReminder.create({
    data: {
      userId,
      signalId: signal.id,
      remindAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    },
  });

  return { ok: true as const, reminded: true };
}

export async function getMySignalState(signalSlug: string) {
  const userId = await requireUserId();
  if (!userId) {
    return { claimed: false, watching: false, reminded: false, authed: false };
  }

  const signal = await prisma.signal.findUnique({ where: { slug: signalSlug } });
  if (!signal) {
    return { claimed: false, watching: false, reminded: false, authed: true };
  }

  const [claim, watch, reminder] = await Promise.all([
    prisma.claim.findUnique({ where: { userId_signalId: { userId, signalId: signal.id } } }),
    prisma.watch.findUnique({ where: { userId_signalId: { userId, signalId: signal.id } } }),
    prisma.cancelReminder.findUnique({
      where: { userId_signalId: { userId, signalId: signal.id } },
    }),
  ]);

  return {
    claimed: !!claim,
    watching: !!watch,
    reminded: !!reminder,
    authed: true,
  };
}

export async function recordSignalShare(signalSlug: string) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, error: "auth_required" };

  const signal = await prisma.signal.findUnique({ where: { slug: signalSlug } });
  if (!signal) return { ok: false as const, error: "not_found" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await prisma.activityEvent.create({
    data: {
      text: `${user?.name?.split(" ")[0] ?? "A hunter"} shared ${signal.title} with a friend`,
      userId,
    },
  });

  return { ok: true as const };
}

const submitOfferSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(500),
  category: z.enum(["GET", "GO", "EAT", "LEARN", "PLAY", "TRY", "KIDS", "ONLINE"]),
  country: z.string().min(2).max(8),
  city: z.string().max(80).optional(),
  location: z.string().max(120).optional(),
  claimUrl: z.string().url().optional().or(z.literal("")),
  claimPhone: z.string().max(40).optional(),
  claimEmail: z.string().email().optional().or(z.literal("")),
  howToClaim: z.string().max(800).optional(),
  normalValue: z.coerce.number().min(0).max(100000).optional(),
});

export async function submitOfferFind(input: z.infer<typeof submitOfferSchema>) {
  const userId = await requireUserId();
  if (!userId) return { ok: false as const, error: "auth_required" };

  const data = submitOfferSchema.parse(input);

  await prisma.offerSubmission.create({
    data: {
      userId,
      title: data.title.trim(),
      summary: data.summary.trim(),
      category: data.category,
      country: data.country.toUpperCase(),
      city: data.city?.trim() || "",
      location: data.location?.trim() || data.city?.trim() || "Nationwide",
      claimUrl: data.claimUrl ? data.claimUrl.trim() : null,
      claimPhone: data.claimPhone?.trim() || null,
      claimEmail: data.claimEmail?.trim() || null,
      howToClaim: data.howToClaim?.trim() || null,
      normalValue: data.normalValue ?? 0,
      status: "PENDING",
    },
  });

  await prisma.activityEvent.create({
    data: {
      text: `New FREE find submitted for review: ${data.title.trim()}`,
      userId,
    },
  });

  return { ok: true as const };
}

function slugifyOffer(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

async function uniqueSignalSlug(base: string) {
  let slug = base || `offer-${Date.now()}`;
  let i = 2;
  while (await prisma.signal.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export async function approveOfferSubmission(submissionId: string) {
  const { requireAdmin } = await import("@/lib/require-admin");
  const session = await requireAdmin();
  if (!session?.user) return { ok: false as const, error: "forbidden" };

  const submission = await prisma.offerSubmission.findUnique({
    where: { id: submissionId },
  });
  if (!submission) return { ok: false as const, error: "not_found" };
  if (submission.status !== "PENDING") {
    return { ok: false as const, error: "already_reviewed" };
  }

  const baseSlug = slugifyOffer(
    `${submission.category}-${submission.country}-${submission.title}`
  );
  const slug = await uniqueSignalSlug(baseSlug);

  const howToClaim =
    submission.howToClaim?.trim() ||
    (submission.claimUrl
      ? "1. Open the official page linked on this signal.\n2. Follow their free entry / signup steps.\n3. Bring confirmation if the venue asks for it."
      : submission.claimPhone || submission.claimEmail
        ? "1. Contact them using the phone or email on this signal.\n2. Ask about the free offer and any booking rules.\n3. Confirm details before you travel."
        : submission.summary);

  await prisma.$transaction([
    prisma.signal.create({
      data: {
        slug,
        title: submission.title,
        summary: submission.summary,
        category: submission.category,
        subcategory: "Community find",
        location: submission.location || submission.city || "Nationwide",
        city: submission.city || "Nationwide",
        country: submission.country,
        freeScore: 78,
        normalValue: submission.normalValue,
        verification: "COMMUNITY",
        status: "NEW",
        claimUrl: submission.claimUrl,
        claimPhone: submission.claimPhone,
        claimEmail: submission.claimEmail,
        howToClaim,
        sourceName:
          submission.source === "hunter"
            ? "Community hunter find"
            : `Auto discovery · ${submission.source}`,
        sourceType: submission.source === "hunter" ? "COMMUNITY" : "CRON",
        evergreen: false,
        active: true,
        tags: ["community", "hunter-find", submission.country.toLowerCase()],
        updates: {
          create: {
            text: "Published from community submission — please confirm the claim path still works.",
          },
        },
      },
    }),
    prisma.offerSubmission.update({
      where: { id: submissionId },
      data: { status: "APPROVED", notes: `Published as /signals/${slug}` },
    }),
    prisma.activityEvent.create({
      data: {
        text: `Admin published community find: ${submission.title}`,
        userId: session.user.id,
      },
    }),
  ]);

  return { ok: true as const, slug };
}

export async function rejectOfferSubmission(submissionId: string, notes?: string) {
  const { requireAdmin } = await import("@/lib/require-admin");
  const session = await requireAdmin();
  if (!session?.user) return { ok: false as const, error: "forbidden" };

  const submission = await prisma.offerSubmission.findUnique({
    where: { id: submissionId },
    select: { id: true, status: true },
  });
  if (!submission) return { ok: false as const, error: "not_found" };
  if (submission.status !== "PENDING") {
    return { ok: false as const, error: "already_reviewed" };
  }

  await prisma.offerSubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      notes: notes?.trim() || "Rejected by admin",
    },
  });

  return { ok: true as const };
}

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      claims: {
        include: { signal: { include: { updates: { take: 3, orderBy: { createdAt: "desc" } } } } },
        orderBy: { createdAt: "desc" },
      },
      watches: {
        include: { signal: { include: { updates: { take: 3, orderBy: { createdAt: "desc" } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return null;

  const { mapSignal } = await import("@/lib/mappers");

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      postcode: user.postcode,
      radiusMiles: user.radiusMiles,
      interests: user.interests,
      savedGBP: user.savedGBP,
      hunterLevel: user.hunterLevel,
    },
    claimed: user.claims.map((c) => mapSignal(c.signal)),
    watching: user.watches.map((w) => mapSignal(w.signal)),
  };
}

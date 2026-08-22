import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  classifySource,
  isBotUserAgent,
  requestMetaFromHeaders,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  path: z.string().min(1).max(400),
  referrer: z.string().max(800).optional().nullable(),
  source: z.string().max(120).optional().nullable(),
  medium: z.string().max(120).optional().nullable(),
  campaign: z.string().max(120).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = bodySchema.parse(json);
    const meta = requestMetaFromHeaders(request.headers);

    if (isBotUserAgent(meta.userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const path = data.path.startsWith("/") ? data.path.slice(0, 400) : `/${data.path}`.slice(0, 400);
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true, skipped: "internal" });
    }

    const source = classifySource({
      referrer: data.referrer,
      source: data.source,
      medium: data.medium,
    });

    await prisma.siteVisit.create({
      data: {
        path,
        referrer: data.referrer?.slice(0, 800) || null,
        source,
        medium: data.medium?.slice(0, 120) || null,
        campaign: data.campaign?.slice(0, 120) || null,
        ip: meta.ip,
        userAgent: meta.userAgent,
        country: meta.country,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

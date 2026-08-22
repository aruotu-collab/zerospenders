import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isBotUserAgent, requestMetaFromHeaders } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  path: z.string().min(1).max(400),
  targetType: z.string().min(1).max(60),
  targetId: z.string().max(120).optional().nullable(),
  targetLabel: z.string().max(240).optional().nullable(),
  href: z.string().max(800).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = bodySchema.parse(json);
    const meta = requestMetaFromHeaders(request.headers);

    if (isBotUserAgent(meta.userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    await prisma.siteClick.create({
      data: {
        path: data.path.startsWith("/") ? data.path.slice(0, 400) : `/${data.path}`.slice(0, 400),
        targetType: data.targetType.slice(0, 60),
        targetId: data.targetId?.slice(0, 120) || null,
        targetLabel: data.targetLabel?.slice(0, 240) || null,
        href: data.href?.slice(0, 800) || null,
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

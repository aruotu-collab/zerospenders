import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCronAuthorized } from "@/lib/cron-auth";
import { runOfferRecheck } from "@/lib/discovery/recheck-offers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const stats = await runOfferRecheck(prisma);
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("recheck-offers cron failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "recheck failed" },
      { status: 500 }
    );
  }
}

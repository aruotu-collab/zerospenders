import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isCronAuthorized } from "@/lib/cron-auth";
import { runDailyDiscovery } from "@/lib/discovery/run-discovery";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const stats = await runDailyDiscovery(prisma);
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("discover-offers cron failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "discovery failed" },
      { status: 500 }
    );
  }
}

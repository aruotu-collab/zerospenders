import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runDailyDiscovery } from "@/lib/discovery/run-discovery";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  if (process.env.VERCEL === "1" && request.headers.get("x-vercel-cron") === "1") {
    return true;
  }
  return false;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
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

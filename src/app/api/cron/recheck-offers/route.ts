import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runOfferRecheck } from "@/lib/discovery/recheck-offers";

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

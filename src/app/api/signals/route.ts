import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COUNTRY_COOKIE, resolveCountry } from "@/lib/countries";
import { listSignals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nearOnly = searchParams.get("near") === "1";
  const category = searchParams.get("category") as
    | "get"
    | "go"
    | "eat"
    | "learn"
    | "play"
    | "try"
    | "kids"
    | "online"
    | null;

  const jar = await cookies();
  const country = resolveCountry(
    searchParams.get("country") ?? jar.get(COUNTRY_COOKIE)?.value
  );

  const signals = await listSignals({
    category: category ?? undefined,
    nearOnly,
    country,
  });

  if (nearOnly) {
    const all = await listSignals({ country });
    return NextResponse.json({
      near: signals,
      extra: all.filter((s) => s.distanceMiles === undefined),
    });
  }

  return NextResponse.json({ signals });
}

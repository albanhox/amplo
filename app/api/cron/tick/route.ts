import { NextRequest, NextResponse } from "next/server";
import { tick } from "@/lib/autopilot/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Autopilot heartbeat. Point a cron (Vercel Cron, GitHub Actions, or any
 * scheduler) at this route every 15–60 minutes.
 *
 * Protect it: set CRON_SECRET and call with `Authorization: Bearer <secret>`
 * or `?key=<secret>`. If CRON_SECRET is unset (local/demo), it runs open.
 */
async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const key = req.nextUrl.searchParams.get("key");
    const ok = auth === `Bearer ${secret}` || key === secret;
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Optional clock override (testing / backfill), e.g. ?now=2026-08-01T10:00:00Z
  const nowParam = req.nextUrl.searchParams.get("now");
  const now = nowParam ? new Date(nowParam) : new Date();
  const summary = await tick(isNaN(now.getTime()) ? new Date() : now);
  return NextResponse.json(summary);
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}

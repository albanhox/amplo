import { NextRequest, NextResponse } from "next/server";
import { accounts } from "@/lib/db/repo";
import { accountFromRequest, publicAccount } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cancel the subscription. (Simulated; wire real Stripe cancellation in prod.) */
export async function POST(req: NextRequest) {
  const account = accountFromRequest(req);
  if (!account) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const updated = accounts.update(account.id, { subscriptionStatus: "canceled", plan: "starter" });
  return NextResponse.json({ account: publicAccount(updated || account) });
}

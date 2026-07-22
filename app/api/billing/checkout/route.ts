import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/billing/stripe";
import { createAccount } from "@/lib/db/repo";
import { accountFromRequest } from "@/lib/auth";
import type { PlanId } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { plan?: PlanId; cadence?: "monthly" | "yearly"; email?: string; amountMonthly?: number; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const plan = body.plan || "growth";
  // Charge the logged-in account; fall back to demo only when anonymous.
  const account = (await accountFromRequest(req)) || (await createAccount(body.email || "demo@amplo.co"));
  const email = account.email;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  try {
    const result = await createCheckout({
      accountId: account.id,
      email,
      plan,
      cadence: body.cadence || "monthly",
      appUrl,
      amountMonthly: body.amountMonthly,
      label: body.label,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { reviewToPost } from "@/lib/agents/reviewAgent";
import { accountFromRequest } from "@/lib/auth";
import { isPaidAccount, UPGRADE_MESSAGE } from "@/lib/plan";
import type { BrandProfile, ReviewInput } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Reviews → posts is a paid feature.
  const account = await accountFromRequest(req);
  if (account && !isPaidAccount(account)) {
    return NextResponse.json({ error: UPGRADE_MESSAGE, upgrade: true }, { status: 402 });
  }

  let body: { brand: BrandProfile; review: ReviewInput };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.brand?.businessName || !body?.review?.text) {
    return NextResponse.json(
      { error: "brand.businessName and review.text are required" },
      { status: 400 }
    );
  }

  try {
    const result = await reviewToPost(body.brand, body.review);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not generate post" },
      { status: 422 }
    );
  }
}

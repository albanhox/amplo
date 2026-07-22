import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, isGoogleConfigured, exchangeGoogleCode } from "@/lib/integrations/google";
import { brands } from "@/lib/db/repo";
import { accountFromRequest } from "@/lib/auth";
import { isPaidAccount } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start the Google Business OAuth flow. /api/connect/google?brandId=... */
export async function GET(req: NextRequest) {
  const account = await accountFromRequest(req);
  if (account && !isPaidAccount(account)) {
    return NextResponse.redirect(new URL("/dashboard?upgrade=connect", req.url));
  }
  const brandId = req.nextUrl.searchParams.get("brandId") || "";

  // Demo mode (no credentials): simulate the connection and return.
  if (!isGoogleConfigured()) {
    const conn = await exchangeGoogleCode("");
    const brand = brandId ? await brands.get(brandId) : undefined;
    if (brand) await brands.update(brand.id, { connections: { ...brand.connections, google: conn } });
    return NextResponse.redirect(new URL("/dashboard?connect=google_ok&sim=1", req.url));
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  return NextResponse.redirect(googleAuthUrl(state));
}

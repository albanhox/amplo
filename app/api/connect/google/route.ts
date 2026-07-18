import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, isGoogleConfigured, exchangeGoogleCode } from "@/lib/integrations/google";
import { brands } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start the Google Business OAuth flow. /api/connect/google?brandId=... */
export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId") || "";

  // Demo mode (no credentials): simulate the connection and return.
  if (!isGoogleConfigured()) {
    const conn = await exchangeGoogleCode("");
    const brand = brandId ? brands.get(brandId) : undefined;
    if (brand) brands.update(brand.id, { connections: { ...brand.connections, google: conn } });
    return NextResponse.redirect(new URL("/dashboard?connect=google_ok&sim=1", req.url));
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  return NextResponse.redirect(googleAuthUrl(state));
}

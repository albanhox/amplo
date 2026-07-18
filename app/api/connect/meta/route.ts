import { NextRequest, NextResponse } from "next/server";
import { metaAuthUrl, isMetaConfigured, exchangeMetaCode } from "@/lib/integrations/meta";
import { brands } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start the Meta (Facebook + Instagram) OAuth flow. /api/connect/meta?brandId=... */
export async function GET(req: NextRequest) {
  const brandId = req.nextUrl.searchParams.get("brandId") || "";

  // Demo mode (no credentials): simulate the connection and return.
  if (!isMetaConfigured()) {
    const conn = await exchangeMetaCode("");
    const brand = brandId ? brands.get(brandId) : undefined;
    if (brand) brands.update(brand.id, { connections: { ...brand.connections, meta: conn } });
    return NextResponse.redirect(new URL("/dashboard?connect=meta_ok&sim=1", req.url));
  }

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64url");
  return NextResponse.redirect(metaAuthUrl(state));
}

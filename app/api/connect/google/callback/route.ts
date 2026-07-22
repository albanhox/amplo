import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/integrations/google";
import { brands } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  const stateRaw = req.nextUrl.searchParams.get("state") || "";
  let brandId = "";
  try {
    brandId = JSON.parse(Buffer.from(stateRaw, "base64url").toString()).brandId;
  } catch {}

  try {
    const connection = await exchangeGoogleCode(code);
    if (brandId) {
      const brand = await brands.get(brandId);
      if (brand) await brands.update(brandId, { connections: { ...brand.connections, google: connection } });
    }
  } catch {
    return NextResponse.redirect(new URL("/dashboard?connect=google_error", req.url));
  }
  return NextResponse.redirect(new URL("/dashboard?connect=google_ok", req.url));
}

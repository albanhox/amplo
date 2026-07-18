import { NextRequest, NextResponse } from "next/server";
import { exchangeMetaCode } from "@/lib/integrations/meta";
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
    const connection = await exchangeMetaCode(code);
    if (brandId) {
      const brand = brands.get(brandId);
      if (brand) brands.update(brandId, { connections: { ...brand.connections, meta: connection } });
    }
  } catch {
    return NextResponse.redirect(new URL("/dashboard?connect=meta_error", req.url));
  }
  return NextResponse.redirect(new URL("/dashboard?connect=meta_ok", req.url));
}

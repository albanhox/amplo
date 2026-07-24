import { NextRequest, NextResponse } from "next/server";
import { brands, createAccount } from "@/lib/db/repo";
import { newId } from "@/lib/db/store";
import { accountFromRequest } from "@/lib/auth";
import { isPaidAccount, UPGRADE_MESSAGE } from "@/lib/plan";
import type { Brand } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create/persist a brand from onboarding. */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.nicheId || !body?.businessName) {
    return NextResponse.json({ error: "nicheId and businessName are required" }, { status: 400 });
  }

  // Prefer the logged-in account; fall back to demo for anonymous use.
  const account = (await accountFromRequest(req)) || (await createAccount(body.email || "demo@pop-d.com"));
  const brand: Brand = {
    id: newId("brand"),
    accountId: account.id,
    nicheId: body.nicheId,
    businessName: body.businessName,
    city: body.city,
    about: body.about,
    tone: body.tone || [],
    platforms: body.platforms || ["Instagram"],
    contentTypes: body.types || body.contentTypes || ["tip", "review", "offer", "seo"],
    accent: body.accent,
    logoDataUrl: body.logoDataUrl,
    templateIds: body.templateIds,
    media: body.media,
    autopilot: false,
    connections: {},
    createdAt: new Date().toISOString(),
  };
  await brands.upsert(brand);
  return NextResponse.json({ brandId: brand.id, accountId: account.id });
}

/** Update a brand (e.g. toggle autopilot). */
export async function PATCH(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Autopilot is a paid feature.
  if (body.autopilot === true) {
    const account = await accountFromRequest(req);
    if (account && !isPaidAccount(account)) {
      return NextResponse.json({ error: UPGRADE_MESSAGE, upgrade: true }, { status: 402 });
    }
  }

  const { id, ...patch } = body;
  const updated = await brands.update(id, patch);
  if (!updated) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  return NextResponse.json({ brand: updated });
}

/** Read a brand by id: /api/brands?id=... */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const brand = await brands.get(id);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

import { NextRequest, NextResponse } from "next/server";
import { accountFromRequest, publicAccount } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const account = await accountFromRequest(req);
  if (!account) return NextResponse.json({ account: null }, { status: 200 });
  return NextResponse.json({ account: publicAccount(account) });
}

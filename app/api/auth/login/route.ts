import { NextRequest, NextResponse } from "next/server";
import { findAccountByEmail } from "@/lib/db/repo";
import { verifyPassword, startSession, publicAccount, SESSION_COOKIE, cookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  const account = await findAccountByEmail(email);
  if (!account || !verifyPassword(body.password || "", account.passwordHash)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  const token = await startSession(account.id);
  const res = NextResponse.json({ account: publicAccount(account) });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return res;
}

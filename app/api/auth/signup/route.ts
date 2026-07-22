import { NextRequest, NextResponse } from "next/server";
import { accounts, findAccountByEmail } from "@/lib/db/repo";
import { newId } from "@/lib/db/store";
import { hashPassword, startSession, publicAccount, SESSION_COOKIE, cookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (findAccountByEmail(email)) return NextResponse.json({ error: "An account with this email already exists. Try logging in." }, { status: 409 });

  const account = accounts.upsert({
    id: newId("acct"),
    email,
    name: body.name?.trim() || undefined,
    passwordHash: hashPassword(password),
    plan: "starter",
    subscriptionStatus: "none",
    createdAt: new Date().toISOString(),
  });

  const token = startSession(account.id);
  const res = NextResponse.json({ account: publicAccount(account) });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return res;
}

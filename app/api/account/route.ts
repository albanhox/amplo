import { NextRequest, NextResponse } from "next/server";
import { accounts, findAccountByEmail } from "@/lib/db/repo";
import { accountFromRequest, publicAccount, hashPassword, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Update the logged-in account: name, email, and/or password. */
export async function PATCH(req: NextRequest) {
  const account = accountFromRequest(req);
  if (!account) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { name?: string; email?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.name === "string") patch.name = body.name.trim();

  if (body.email && body.email.trim().toLowerCase() !== account.email) {
    const email = body.email.trim().toLowerCase();
    if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    if (findAccountByEmail(email)) return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    patch.email = email;
  }

  if (body.newPassword) {
    if (body.newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    if (account.passwordHash && !verifyPassword(body.currentPassword || "", account.passwordHash)) {
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 401 });
    }
    patch.passwordHash = hashPassword(body.newPassword);
  }

  const updated = accounts.update(account.id, patch);
  return NextResponse.json({ account: publicAccount(updated || account) });
}

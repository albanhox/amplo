/**
 * Authentication — password hashing + cookie sessions, using the file-backed
 * store. No external service required. Swap the store for Postgres/Supabase and
 * this keeps working unchanged.
 */
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { accounts, createSession, deleteSession, sessionAccount } from "@/lib/db/repo";
import type { Account } from "@/lib/db/types";

export const SESSION_COOKIE = "amplo_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && timingSafeEqual(known, test);
}

export function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function startSession(accountId: string): string {
  const token = newSessionToken();
  createSession(accountId, token);
  return token;
}

export function endSession(token: string | undefined): void {
  deleteSession(token);
}

/** The logged-in account for a request, or null. */
export function accountFromRequest(req: NextRequest): Account | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return sessionAccount(token) ?? null;
}

/** Safe public shape (never leak the password hash). */
export function publicAccount(a: Account) {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    plan: a.plan,
    subscriptionStatus: a.subscriptionStatus,
  };
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export { accounts };

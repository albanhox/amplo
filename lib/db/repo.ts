/**
 * Repositories — typed access to each collection plus the async queries the app
 * and autopilot engine use.
 */
import { Collection, newId } from "./store";
import type { Account, Brand, ContentItem, ReviewRecord, Session } from "./types";

export const accounts = new Collection<Account>("accounts");
export const brands = new Collection<Brand>("brands");
export const content = new Collection<ContentItem>("content");
export const reviews = new Collection<ReviewRecord>("reviews");
export const sessions = new Collection<Session>("sessions");

/* ---------- accounts ---------- */
export async function createAccount(email: string): Promise<Account> {
  const existing = await findAccountByEmail(email);
  if (existing) return existing;
  return accounts.upsert({
    id: newId("acct"),
    email: email.toLowerCase(),
    plan: "starter",
    subscriptionStatus: "none",
    createdAt: new Date().toISOString(),
  });
}

export async function findAccountByEmail(email: string): Promise<Account | undefined> {
  const e = email.toLowerCase();
  return (await accounts.find((a) => a.email.toLowerCase() === e))[0];
}

/* ---------- sessions ---------- */
export async function createSession(accountId: string, token: string): Promise<Session> {
  return sessions.upsert({ id: token, accountId, createdAt: new Date().toISOString() });
}
export async function sessionAccount(token: string | undefined): Promise<Account | undefined> {
  if (!token) return undefined;
  const s = await sessions.get(token);
  return s ? accounts.get(s.accountId) : undefined;
}
export async function deleteSession(token: string | undefined): Promise<void> {
  if (token) await sessions.remove(token);
}

/* ---------- brands ---------- */
export function brandsByAccount(accountId: string): Promise<Brand[]> {
  return brands.find((b) => b.accountId === accountId);
}
export function autopilotBrands(): Promise<Brand[]> {
  return brands.find((b) => b.autopilot);
}

/* ---------- content ---------- */
export async function queueForBrand(brandId: string): Promise<ContentItem[]> {
  const items = await content.find((c) => c.brandId === brandId);
  return items.sort((a, b) => (a.scheduledAt || a.createdAt).localeCompare(b.scheduledAt || b.createdAt));
}
export async function scheduledCount(brandId: string): Promise<number> {
  return (await content.find((c) => c.brandId === brandId && c.status === "scheduled")).length;
}
export function duePosts(nowIso: string): Promise<ContentItem[]> {
  return content.find((c) => c.status === "scheduled" && !!c.scheduledAt && c.scheduledAt <= nowIso);
}

/* ---------- reviews ---------- */
export function unprocessedReviews(brandId: string): Promise<ReviewRecord[]> {
  return reviews.find((r) => r.brandId === brandId && !r.processed);
}

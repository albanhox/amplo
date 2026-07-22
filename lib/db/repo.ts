/**
 * Repositories — typed access to each collection plus the queries the app and
 * autopilot engine actually use.
 */
import { Collection, newId } from "./store";
import type { Account, Brand, ContentItem, ReviewRecord, Session } from "./types";

export const accounts = new Collection<Account>("accounts");
export const brands = new Collection<Brand>("brands");
export const content = new Collection<ContentItem>("content");
export const reviews = new Collection<ReviewRecord>("reviews");
export const sessions = new Collection<Session>("sessions");

/* ---------- accounts ---------- */
export function createAccount(email: string): Account {
  const existing = findAccountByEmail(email);
  if (existing) return existing;
  return accounts.upsert({
    id: newId("acct"),
    email: email.toLowerCase(),
    plan: "starter",
    subscriptionStatus: "none",
    createdAt: new Date().toISOString(),
  });
}

export function findAccountByEmail(email: string): Account | undefined {
  const e = email.toLowerCase();
  return accounts.find((a) => a.email.toLowerCase() === e)[0];
}

/* ---------- sessions ---------- */
export function createSession(accountId: string, token: string): Session {
  return sessions.upsert({ id: token, accountId, createdAt: new Date().toISOString() });
}
export function sessionAccount(token: string | undefined): Account | undefined {
  if (!token) return undefined;
  const s = sessions.get(token);
  return s ? accounts.get(s.accountId) : undefined;
}
export function deleteSession(token: string | undefined): void {
  if (token) sessions.remove(token);
}

/* ---------- brands ---------- */
export function brandsByAccount(accountId: string): Brand[] {
  return brands.find((b) => b.accountId === accountId);
}

export function autopilotBrands(): Brand[] {
  return brands.find((b) => b.autopilot);
}

/* ---------- content ---------- */
export function queueForBrand(brandId: string): ContentItem[] {
  return content
    .find((c) => c.brandId === brandId)
    .sort((a, b) => (a.scheduledAt || a.createdAt).localeCompare(b.scheduledAt || b.createdAt));
}

export function scheduledCount(brandId: string): number {
  return content.find((c) => c.brandId === brandId && c.status === "scheduled").length;
}

/** Posts that are scheduled and due to publish now. */
export function duePosts(nowIso: string): ContentItem[] {
  return content.find(
    (c) => c.status === "scheduled" && !!c.scheduledAt && c.scheduledAt <= nowIso
  );
}

/* ---------- reviews ---------- */
export function unprocessedReviews(brandId: string): ReviewRecord[] {
  return reviews.find((r) => r.brandId === brandId && !r.processed);
}

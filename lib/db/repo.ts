/**
 * Repositories — typed access to each collection plus the queries the app and
 * autopilot engine actually use.
 */
import { Collection, newId } from "./store";
import type { Account, Brand, ContentItem, ReviewRecord } from "./types";

export const accounts = new Collection<Account>("accounts");
export const brands = new Collection<Brand>("brands");
export const content = new Collection<ContentItem>("content");
export const reviews = new Collection<ReviewRecord>("reviews");

/* ---------- accounts ---------- */
export function createAccount(email: string): Account {
  const existing = accounts.find((a) => a.email === email)[0];
  if (existing) return existing;
  return accounts.upsert({
    id: newId("acct"),
    email,
    plan: "starter",
    subscriptionStatus: "none",
    createdAt: new Date().toISOString(),
  });
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

/**
 * Plan gating — the single rule for what "paid" means.
 *
 * Free (Starter) accounts can preview content but cannot publish, schedule,
 * turn reviews into posts, run autopilot, or connect accounts. Paid = an active
 * or trialing subscription, or an explicitly paid plan.
 */
export interface PlanLike {
  plan?: string;
  subscriptionStatus?: string;
}

export function isPaidAccount(a: PlanLike | null | undefined): boolean {
  if (!a) return false;
  if (a.subscriptionStatus === "active" || a.subscriptionStatus === "trialing") return true;
  return a.plan === "growth" || a.plan === "pro";
}

/** Features locked behind a paid plan. */
export const PAID_FEATURES = {
  publish: "Publishing & scheduling",
  reviews: "Turning reviews into posts",
  autopilot: "Autopilot",
  connect: "Connecting Google, Instagram & Facebook",
} as const;

export const UPGRADE_MESSAGE =
  "That's a paid feature. Start your free trial to publish, turn reviews into posts, and switch on autopilot.";

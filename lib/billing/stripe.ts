/**
 * Stripe billing — subscriptions for the flat plans + a hook for metered
 * usage add-ons. Runs in "simulated" mode with no key so checkout still flows
 * through the product; set STRIPE_SECRET_KEY to charge for real.
 */
import Stripe from "stripe";
import { accounts } from "@/lib/db/repo";
import type { PlanId } from "@/lib/db/types";

const SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export function isBillingConfigured(): boolean {
  return Boolean(SECRET);
}

let client: Stripe | null = null;
function stripe(): Stripe {
  // Pin nothing — use the account's default API version (version-proof).
  if (!client) client = new Stripe(SECRET as string);
  return client;
}

/** Map a plan + cadence to a Stripe price id (from env). */
function priceId(plan: PlanId, cadence: "monthly" | "yearly"): string | undefined {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cadence.toUpperCase()}`;
  return process.env[key];
}

export interface CheckoutResult {
  url: string;
  simulated: boolean;
}

export async function createCheckout(opts: {
  accountId: string;
  email: string;
  plan: PlanId;
  cadence: "monthly" | "yearly";
  appUrl: string;
  /** Choice-based amount in whole dollars/month. When set, we charge this
   *  exact amount via an inline recurring price instead of a fixed plan. */
  amountMonthly?: number;
  label?: string;
}): Promise<CheckoutResult> {
  const price = priceId(opts.plan, opts.cadence);
  const dynamic = typeof opts.amountMonthly === "number" && opts.amountMonthly > 0;

  // No Stripe key (or a $0 selection): simulate — activate and bounce to success.
  if (!isBillingConfigured() || opts.plan === "starter" || (!dynamic && !price)) {
    await accounts.update(opts.accountId, {
      plan: opts.plan,
      subscriptionStatus: opts.plan === "starter" ? "none" : "active",
    });
    return { url: `${opts.appUrl}/dashboard?checkout=success&sim=1`, simulated: true };
  }

  const line_items = dynamic
    ? [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" as const },
            unit_amount: Math.round(opts.amountMonthly! * 100),
            product_data: { name: opts.label || "Amplo plan" },
          },
          quantity: 1,
        },
      ]
    : [{ price: price as string, quantity: 1 }];

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: opts.email,
    line_items,
    subscription_data: {
      trial_period_days: 14,
      metadata: { accountId: opts.accountId, plan: opts.plan, amountMonthly: String(opts.amountMonthly ?? "") },
    },
    success_url: `${opts.appUrl}/dashboard?checkout=success`,
    cancel_url: `${opts.appUrl}/#pricing`,
    metadata: { accountId: opts.accountId, plan: opts.plan },
  });
  return { url: session.url as string, simulated: false };
}

/** Verify + parse a Stripe webhook, then reconcile the account. */
export async function handleWebhook(rawBody: string, signature: string | null): Promise<{ received: true }> {
  if (!isBillingConfigured() || !WEBHOOK_SECRET || !signature) {
    // Nothing to verify in demo mode.
    return { received: true };
  }
  const event = stripe().webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const obj = event.data.object as any;
      const accountId = obj.metadata?.accountId;
      if (accountId) {
        await accounts.update(accountId, {
          subscriptionStatus: mapStatus(obj.status),
          plan: (obj.metadata?.plan as PlanId) || undefined,
          stripeCustomerId: obj.customer,
          stripeSubscriptionId: obj.subscription || obj.id,
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const obj = event.data.object as any;
      if (obj.metadata?.accountId) {
        await accounts.update(obj.metadata.accountId, { subscriptionStatus: "canceled" });
      }
      break;
    }
  }
  return { received: true };
}

function mapStatus(s: string): "trialing" | "active" | "past_due" | "canceled" | "none" {
  if (s === "trialing" || s === "active" || s === "past_due" || s === "canceled") return s;
  return "none";
}

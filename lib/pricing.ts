/**
 * Pricing model — flat monthly plans + usage-based add-ons.
 *
 * This is the single source of truth for what each plan includes. Wire the
 * `stripePriceId` fields to your Stripe products to go live with billing.
 */

export interface Plan {
  id: "starter" | "growth" | "pro";
  name: string;
  tagline: string;
  monthly: number;
  yearlyMonthly: number; // effective monthly price when billed yearly
  featured?: boolean;
  cta: string;
  postsPerMonth: number | "unlimited";
  platforms: number | "all";
  features: string[];
  stripePriceId?: { monthly?: string; yearly?: string };
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For the solo pro getting consistent at last.",
    monthly: 0,
    yearlyMonthly: 0,
    cta: "Start free",
    postsPerMonth: 12,
    platforms: 1,
    features: [
      "12 AI posts / month",
      "1 social platform",
      "Content studio + brand voice",
      "Manual approve & post",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Full autopilot across your channels.",
    monthly: 149,
    yearlyMonthly: 124,
    featured: true,
    cta: "Start 14-day trial",
    postsPerMonth: "unlimited",
    platforms: "all",
    features: [
      "Unlimited AI posts",
      "All platforms — IG, FB, GBP, TikTok, LinkedIn",
      "Google reviews → posts, automatic",
      "Short-video scripts + local SEO",
      "Full autopilot scheduling",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For teams, multi-location & agencies.",
    monthly: 349,
    yearlyMonthly: 291,
    cta: "Talk to us",
    postsPerMonth: "unlimited",
    platforms: "all",
    features: [
      "Everything in Growth",
      "Up to 5 locations / brands",
      "White-label — your logo & domain",
      "Team seats + approval workflows",
      "Priority support & onboarding",
    ],
  },
];

/** Usage-based add-ons, metered and billed on top of any plan. */
export const ADDONS = [
  { id: "extra_brand", label: "Extra brand / location", unit: "per brand / mo", price: 79 },
  { id: "extra_posts", label: "Content boost (+50 posts)", unit: "per pack / mo", price: 39 },
  { id: "ads_creative", label: "Ad creative pack", unit: "per 10 / mo", price: 59 },
  { id: "video_edit", label: "Done-for-you video editing", unit: "per video", price: 25 },
];

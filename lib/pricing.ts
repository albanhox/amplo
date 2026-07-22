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
    name: "Free",
    tagline: "A taste of Amplo — see it write for your business.",
    monthly: 0,
    yearlyMonthly: 0,
    cta: "Try it free",
    postsPerMonth: 3,
    platforms: 0,
    features: [
      "3 sample AI posts to preview your voice",
      "Explore the dashboard & templates",
      "Draft only — no scheduling or publishing",
      "Reviews → posts, autopilot & account connections are paid",
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

/* ─────────────────────────────────────────────────────────────
 * Choice-based pricing engine
 * The price is computed from exactly what the customer picks, so a
 * light user pays less and a full-service agency pays more — no fixed tiers.
 * ───────────────────────────────────────────────────────────── */

export const FREQUENCY_TIERS = [
  { perWeek: 3, price: 99, label: "Consistent" },
  { perWeek: 5, price: 149, label: "Grow" },
  { perWeek: 7, price: 199, label: "All-in" },
] as const;

/** Optional capabilities the customer can switch on, priced per month. */
export const PRICE_OPTIONS = {
  extraPlatform: 10, // each platform beyond the 3 included
  autopilot: 30, // full auto-publish (vs. approve-first)
  videoScripts: 25, // short-video scripts each month
  dfyDesign: 49, // done-for-you design & media
  adCreative: 59, // ad creative pack
  extraBrand: 79, // each additional brand / location
} as const;

export const INCLUDED_PLATFORMS = 3;

export interface QuoteSelection {
  postsPerWeek: number;
  platforms: number;
  autopilot: boolean;
  videoScripts: boolean;
  dfyDesign: boolean;
  adCreative: boolean;
  extraBrands: number;
}

export interface QuoteLine {
  id: string;
  label: string;
  amount: number;
  included?: boolean;
}

export interface Quote {
  lines: QuoteLine[];
  monthly: number;
  baseLabel: string;
}

export function defaultSelection(postsPerWeek = 5, platforms = 3): QuoteSelection {
  return { postsPerWeek, platforms, autopilot: false, videoScripts: false, dfyDesign: false, adCreative: false, extraBrands: 0 };
}

export function computeQuote(sel: QuoteSelection): Quote {
  const tier =
    [...FREQUENCY_TIERS].reverse().find((t) => sel.postsPerWeek >= t.perWeek) ?? FREQUENCY_TIERS[0];

  const lines: QuoteLine[] = [
    { id: "base", label: `${tier.label} plan — ${tier.perWeek} posts/week`, amount: tier.price },
    { id: "reviews", label: "Google reviews → posts", amount: 0, included: true },
    { id: "brandkit", label: "Brand kit + templates", amount: 0, included: true },
  ];

  const extraPlats = Math.max(0, sel.platforms - INCLUDED_PLATFORMS);
  if (extraPlats > 0) lines.push({ id: "platforms", label: `${extraPlats} extra platform${extraPlats > 1 ? "s" : ""}`, amount: extraPlats * PRICE_OPTIONS.extraPlatform });
  if (sel.autopilot) lines.push({ id: "autopilot", label: "Full autopilot (auto-publish)", amount: PRICE_OPTIONS.autopilot });
  if (sel.videoScripts) lines.push({ id: "video", label: "Short-video scripts", amount: PRICE_OPTIONS.videoScripts });
  if (sel.dfyDesign) lines.push({ id: "dfy", label: "Done-for-you design & media", amount: PRICE_OPTIONS.dfyDesign });
  if (sel.adCreative) lines.push({ id: "ads", label: "Ad creative pack", amount: PRICE_OPTIONS.adCreative });
  if (sel.extraBrands > 0) lines.push({ id: "brands", label: `${sel.extraBrands} extra brand${sel.extraBrands > 1 ? "s" : ""} / location${sel.extraBrands > 1 ? "s" : ""}`, amount: sel.extraBrands * PRICE_OPTIONS.extraBrand });

  const monthly = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, monthly, baseLabel: tier.label };
}

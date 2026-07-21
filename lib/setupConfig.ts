/**
 * Setup config for the realtor / loan-officer onboarding.
 *
 * Keeps the wizard dead simple: everything the user picks from lives here, with
 * smart defaults pre-selected so they can breeze through in under a minute.
 */

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  /** Pre-checked in the wizard. */
  on: boolean;
}

export interface SetupRole {
  id: "realtor" | "loanOfficer";
  nicheId: string; // maps to lib/niches
  label: string;
  emoji: string;
  blurb: string;
  defaultPlatforms: string[];
  themes: Theme[];
}

export const SETUP_ROLES: SetupRole[] = [
  {
    id: "realtor",
    nicheId: "realtor",
    label: "Real Estate Agent",
    emoji: "🏡",
    blurb: "Listings, market updates & buyer/seller tips",
    defaultPlatforms: ["Instagram", "Facebook", "Google Business"],
    themes: [
      { id: "market", label: "Market updates", emoji: "📈", on: true },
      { id: "listings", label: "New listings", emoji: "🔑", on: true },
      { id: "justsold", label: "Just sold", emoji: "🎉", on: true },
      { id: "tips", label: "Buyer & seller tips", emoji: "💡", on: true },
      { id: "reviews", label: "Client wins & reviews", emoji: "⭐", on: true },
      { id: "openhouse", label: "Open houses", emoji: "🚪", on: false },
      { id: "neighborhood", label: "Neighborhood spotlights", emoji: "📍", on: false },
      { id: "seasonal", label: "Seasonal & holidays", emoji: "🗓️", on: false },
    ],
  },
  {
    id: "loanOfficer",
    nicheId: "loanOfficer",
    label: "Loan Officer",
    emoji: "🏦",
    blurb: "Rates, loan programs & first-time buyer help",
    defaultPlatforms: ["Instagram", "Facebook", "LinkedIn", "Google Business"],
    themes: [
      { id: "rates", label: "Rate & market updates", emoji: "📉", on: true },
      { id: "firsttime", label: "First-time buyer tips", emoji: "🏡", on: true },
      { id: "programs", label: "Loan programs (FHA / VA / etc.)", emoji: "📋", on: true },
      { id: "reviews", label: "Client closings & reviews", emoji: "⭐", on: true },
      { id: "myths", label: "Myth-busting", emoji: "🧨", on: true },
      { id: "preapproval", label: "Pre-approval & refi CTAs", emoji: "✅", on: false },
      { id: "credit", label: "Credit & down-payment tips", emoji: "💳", on: false },
      { id: "seasonal", label: "Seasonal & holidays", emoji: "🗓️", on: false },
    ],
  },
];

export const VOICES = [
  { id: "professional", label: "Professional", emoji: "👔", hint: "Polished and credible" },
  { id: "friendly", label: "Friendly", emoji: "😊", hint: "Warm and approachable", default: true },
  { id: "energetic", label: "High-energy", emoji: "🔥", hint: "Bold and punchy" },
  { id: "luxury", label: "Luxury", emoji: "✨", hint: "Elevated and refined" },
];

export const FREQUENCIES = [
  { id: "light", label: "Keep me consistent", perWeek: 3, hint: "3 posts / week" },
  { id: "grow", label: "Grow steadily", perWeek: 5, hint: "5 posts / week", recommended: true },
  { id: "allin", label: "Go all-in", perWeek: 7, hint: "Daily posts" },
];

export function getSetupRole(id: string): SetupRole | undefined {
  return SETUP_ROLES.find((r) => r.id === id);
}

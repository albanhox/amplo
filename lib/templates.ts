/**
 * Post template library.
 *
 * Each template is a visual "look" for a post — a layout + color treatment the
 * design engine fills with the AI-written copy (and the user's logo/photos).
 * Tailored to real estate + mortgage. Users browse these and pick favorites;
 * Popd rotates through the chosen ones.
 */

export type TemplateCategory =
  | "Listing"
  | "Just Sold"
  | "Market Stat"
  | "Tip"
  | "Quote"
  | "Review"
  | "Offer"
  | "Rate Update";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Which roles it fits. */
  roles: ("realtor" | "loanOfficer")[];
  blurb: string;
  /** Visual spec used to render the preview + the real design. */
  style: {
    /** CSS background (gradient or solid) using brand vars where sensible. */
    bg: string;
    /** Foreground text color. */
    fg: string;
    /** Layout hint the renderer understands. */
    layout: "photo-bottom" | "photo-full" | "split" | "stat-hero" | "quote" | "badge";
    /** Whether it expects one of the user's uploaded photos. */
    usesPhoto: boolean;
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "listing-hero",
    name: "Listing Hero",
    category: "Listing",
    roles: ["realtor"],
    blurb: "Full-bleed property photo with price + details bar.",
    style: { bg: "#0E2E28", fg: "#ffffff", layout: "photo-full", usesPhoto: true },
  },
  {
    id: "just-listed-card",
    name: "Just Listed",
    category: "Listing",
    roles: ["realtor"],
    blurb: "Clean card with a “JUST LISTED” ribbon and your photo.",
    style: { bg: "linear-gradient(145deg,#EE5A36,#C6431F)", fg: "#ffffff", layout: "photo-bottom", usesPhoto: true },
  },
  {
    id: "just-sold-badge",
    name: "Just Sold",
    category: "Just Sold",
    roles: ["realtor", "loanOfficer"],
    blurb: "Celebration badge — SOLD stamp, address, and your headshot.",
    style: { bg: "linear-gradient(145deg,#123B33,#0E2E28)", fg: "#ffffff", layout: "badge", usesPhoto: true },
  },
  {
    id: "market-stat",
    name: "Market Stat",
    category: "Market Stat",
    roles: ["realtor", "loanOfficer"],
    blurb: "Big number hero — days on market, median price, inventory.",
    style: { bg: "linear-gradient(160deg,#FBFAF5,#F0EEE7)", fg: "#191C18", layout: "stat-hero", usesPhoto: false },
  },
  {
    id: "rate-update",
    name: "Rate Update",
    category: "Rate Update",
    roles: ["loanOfficer"],
    blurb: "This week’s rates as a clean, shareable snapshot.",
    style: { bg: "linear-gradient(160deg,#0E2E28,#123B33)", fg: "#ffffff", layout: "stat-hero", usesPhoto: false },
  },
  {
    id: "tip-bold",
    name: "Bold Tip",
    category: "Tip",
    roles: ["realtor", "loanOfficer"],
    blurb: "Punchy typographic tip on a solid brand color.",
    style: { bg: "var(--brand)", fg: "#ffffff", layout: "quote", usesPhoto: false },
  },
  {
    id: "quote-editorial",
    name: "Editorial Quote",
    category: "Quote",
    roles: ["realtor", "loanOfficer"],
    blurb: "Magazine-style quote with your logo, on soft paper.",
    style: { bg: "linear-gradient(160deg,#FBFAF5,#F4F3EE)", fg: "#191C18", layout: "quote", usesPhoto: false },
  },
  {
    id: "review-spotlight",
    name: "Review Spotlight",
    category: "Review",
    roles: ["realtor", "loanOfficer"],
    blurb: "5-star review with stars, name, and your branding.",
    style: { bg: "linear-gradient(145deg,#123B33,#0E2E28)", fg: "#ffffff", layout: "quote", usesPhoto: false },
  },
  {
    id: "offer-cta",
    name: "Offer / CTA",
    category: "Offer",
    roles: ["realtor", "loanOfficer"],
    blurb: "High-contrast promo with a clear call to action.",
    style: { bg: "linear-gradient(145deg,#EE5A36,#C6431F)", fg: "#ffffff", layout: "badge", usesPhoto: false },
  },
  {
    id: "split-photo",
    name: "Split Photo",
    category: "Tip",
    roles: ["realtor", "loanOfficer"],
    blurb: "Half photo, half message — great for headshots.",
    style: { bg: "#FBFAF5", fg: "#191C18", layout: "split", usesPhoto: true },
  },
];

export function templatesForRole(roleId: string): Template[] {
  return TEMPLATES.filter((t) => t.roles.includes(roleId as any));
}

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Sensible default selection for a new user of a given role. */
export function defaultTemplateIds(roleId: string): string[] {
  return templatesForRole(roleId).slice(0, 5).map((t) => t.id);
}

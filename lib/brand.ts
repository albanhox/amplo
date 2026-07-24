/**
 * Brand configuration — the single source of truth for the product name and
 * identity. Renaming the whole product is a one-line change here.
 */
export const BRAND = {
  name: "Popd",
  tagline: "Local marketing on autopilot",
  domain: "pop-d.com",
  appDomain: "app.pop-d.com",
  supportEmail: "hello@pop-d.com",
  // Persimmon + spruce identity.
  colors: {
    brand: "#EE5A36",
    spruce: "#123B33",
    gold: "#E4A32C",
  },
  oneLiner:
    "Popd runs social media and local SEO for local businesses automatically — writing posts, turning Google reviews into content, and keeping you visible.",
} as const;

export type Brand = typeof BRAND;

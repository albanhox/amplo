import type { ContentType } from "@/lib/niches";

export type PlanId = "starter" | "growth" | "pro";
export type SubStatus = "none" | "trialing" | "active" | "past_due" | "canceled";

export interface Account {
  id: string;
  email: string;
  plan: PlanId;
  subscriptionStatus: SubStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  createdAt: string;
}

export interface Connection {
  connected: boolean;
  /** Access token — encrypt at rest in production. */
  accessToken?: string;
  refreshToken?: string;
  /** Google Business location id / Meta page or IG id. */
  externalId?: string;
  accountName?: string;
  connectedAt?: string;
}

export interface Brand {
  id: string;
  accountId: string;
  nicheId: string;
  businessName: string;
  city?: string;
  about?: string;
  tone: string[];
  platforms: string[];
  contentTypes: ContentType[];
  accent?: string;
  /** Brand kit — logo stored as a data URL (swap for object storage in prod). */
  logoDataUrl?: string;
  /** Selected post template ids (see lib/templates). */
  templateIds?: string[];
  /** User-uploaded reference photos / posts they liked. */
  media?: { id: string; dataUrl?: string; note?: string }[];
  autopilot: boolean;
  connections: {
    google?: Connection;
    meta?: Connection;
  };
  createdAt: string;
}

export type ContentStatus = "draft" | "scheduled" | "posted" | "failed";
export type ContentSource = "studio" | "planner" | "review";

export interface ContentItem {
  id: string;
  brandId: string;
  type: ContentType;
  platform: string;
  caption: string;
  hashtags: string[];
  status: ContentStatus;
  source: ContentSource;
  scheduledAt?: string;
  postedAt?: string;
  externalId?: string;
  error?: string;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  brandId: string;
  author: string;
  stars: number;
  text: string;
  source: "google";
  receivedAt: string;
  processed: boolean;
  contentItemId?: string;
}

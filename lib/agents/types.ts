import type { ContentType } from "@/lib/niches";

/** A business's brand identity — collected during onboarding. */
export interface BrandProfile {
  nicheId: string;
  businessName: string;
  city?: string;
  /** Free-text description of the business, offers, and personality. */
  about?: string;
  /** Voice knobs. */
  tone?: string[];
  /** Things to always mention / never mention. */
  doSay?: string[];
  dontSay?: string[];
  platforms?: string[];
  /** Hex accent used when rendering post cards. */
  accent?: string;
}

export interface GenerateRequest {
  brand: BrandProfile;
  type: ContentType;
  /** Optional topic/steer, e.g. "spring market" or "new whitening service". */
  topic?: string;
  /** How many variations to return. */
  count?: number;
}

export interface GeneratedPost {
  type: ContentType;
  platform: string;
  caption: string;
  hashtags: string[];
  /** For video scripts: hook + shot list, already folded into caption. */
  callToAction?: string;
  /** Optional AI-generated visual (nano-banana), as a data: URL. */
  imageUrl?: string;
}

export interface ImageRequest {
  brand: BrandProfile;
  /** The post this image should illustrate (its caption steers the visual). */
  caption?: string;
  /** Optional explicit subject/steer for the image. */
  topic?: string;
}

export interface ReviewInput {
  author: string;
  stars: number;
  text: string;
}

/**
 * Review Agent — the headline feature.
 *
 * Watches Google Business for new reviews and turns 5-star ratings into
 * branded, ready-to-publish social posts that thank the customer and invite
 * new ones. Live path uses Claude; demo path composes from the review text.
 */
import { completeJSON, isLive } from "./anthropic";
import { getNiche } from "@/lib/niches";
import type { BrandProfile, ReviewInput, GeneratedPost } from "./types";

function buildSystem(): string {
  return [
    "You are Amplo, turning a real customer review into a social media post.",
    "Celebrate the customer by first name, echo the specific thing they praised,",
    "and add a warm invitation for new customers. Keep it authentic — never salesy.",
    "Return ONLY JSON: { caption: string, hashtags: string[] (2-4) }.",
  ].join("\n");
}

function buildUser(brand: BrandProfile, review: ReviewInput): string {
  const niche = getNiche(brand.nicheId);
  return [
    `Business: ${brand.businessName}`,
    niche ? `Industry: ${niche.label}` : "",
    `Reviewer: ${review.author}`,
    `Rating: ${review.stars} stars`,
    `Review: "${review.text}"`,
    brand.tone?.length ? `Tone: ${brand.tone.join(", ")}` : niche ? `Tone: ${niche.toneWords.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function demoPost(brand: BrandProfile, review: ReviewInput): GeneratedPost {
  const niche = getNiche(brand.nicheId);
  const firstName = review.author.split(" ")[0];
  const stars = "⭐".repeat(Math.max(1, Math.min(5, review.stars)));
  const caption =
    `Thank you ${firstName} for the kind words! 🙏 ` +
    `Reviews like this are exactly why we do what we do. ` +
    `New here? We'd love to take care of you too. ${stars}`;
  return {
    type: "review",
    platform: brand.platforms?.[0] || niche?.platforms[0] || "Instagram",
    caption,
    hashtags: [brand.businessName.replace(/\s+/g, ""), niche ? niche.label.replace(/\s+/g, "") : "HappyClients"].slice(0, 4),
  };
}

export async function reviewToPost(
  brand: BrandProfile,
  review: ReviewInput
): Promise<{ post: GeneratedPost; live: boolean }> {
  if (review.stars < 4) {
    // Low ratings are routed to a private reply flow, never auto-posted.
    throw new Error("Reviews under 4 stars are handled privately, not published.");
  }
  if (!isLive) return { post: demoPost(brand, review), live: false };
  try {
    const raw = await completeJSON<{ caption: string; hashtags: string[] }>({
      system: buildSystem(),
      user: buildUser(brand, review),
    });
    return {
      post: {
        type: "review",
        platform: brand.platforms?.[0] || "Instagram",
        caption: raw.caption,
        hashtags: Array.isArray(raw.hashtags) ? raw.hashtags.slice(0, 4) : [],
      },
      live: true,
    };
  } catch {
    return { post: demoPost(brand, review), live: false };
  }
}

/**
 * Image Agent — turns a brand + caption into a branded social visual using the
 * nano-banana model (Gemini image generation).
 *
 * Live path: calls Gemini and returns a data: URL. No key (or any failure) →
 * returns null so the caller simply shows the post without an image.
 */
import { generateImage, isLive } from "./gemini";
import { getNiche } from "@/lib/niches";
import type { ImageRequest } from "./types";

function buildImagePrompt(req: ImageRequest): string {
  const niche = getNiche(req.brand.nicheId);
  const subject =
    req.topic ||
    req.caption ||
    (niche ? `${niche.label} for ${niche.audience}` : "a local business");

  const lines = [
    `Create a polished, scroll-stopping social media image for ${req.brand.businessName}` +
      (niche ? `, a ${niche.label}` : "") +
      (req.brand.city ? ` in ${req.brand.city}` : "") +
      ".",
    `Theme: ${subject}.`,
    "Style: modern, clean, professional, warm and inviting, photographic where it fits.",
    req.brand.accent ? `Use ${req.brand.accent} as a subtle accent color.` : "",
    "Square 1:1 composition, uncluttered, leave breathing room. Avoid heavy text overlays,",
    "watermarks, logos, or misspelled words. It should feel premium and on-brand.",
  ].filter(Boolean);

  return lines.join(" ");
}

export async function generatePostImage(
  req: ImageRequest
): Promise<{ imageUrl: string | null; live: boolean }> {
  if (!isLive) return { imageUrl: null, live: false };
  const result = await generateImage(buildImagePrompt(req));
  return { imageUrl: result?.url ?? null, live: Boolean(result) };
}

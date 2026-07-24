/**
 * Content Agent — writes on-brand posts for any niche + content type.
 *
 * Live path: prompts Claude with the brand profile and niche context.
 * Demo path: composes believable output from the niche seed library so the
 * product works with no API key.
 */
import { completeJSON, isLive } from "./anthropic";
import { getNiche, type ContentType } from "@/lib/niches";
import type { GenerateRequest, GeneratedPost } from "./types";

const TYPE_GUIDE: Record<ContentType, string> = {
  tip: "a genuinely useful tip that positions the business as the local expert",
  video: "a short-form video script with a scroll-stopping HOOK, a 3-beat shot list, and a caption",
  review: "a post that celebrates a happy customer and invites new ones",
  offer: "a promotional post with a clear, low-friction call to action",
  seo: "a Google Business / local-SEO post using a location + service keyword naturally",
};

function buildSystem(): string {
  return [
    "You are Popd, an AI social media manager for local service businesses.",
    "You write posts that sound human, specific, and on-brand — never generic or corporate.",
    "Rules: 1-3 short sentences, one clear idea, tasteful emoji, a light call to action.",
    "Return ONLY JSON: an array of objects with keys caption (string), hashtags (string[] of 2-4), platform (string), callToAction (string).",
  ].join("\n");
}

function buildUser(req: GenerateRequest): string {
  const niche = getNiche(req.brand.nicheId);
  const lines = [
    `Business: ${req.brand.businessName}`,
    niche ? `Industry: ${niche.label} (${niche.audience})` : "",
    req.brand.city ? `City: ${req.brand.city}` : "",
    req.brand.about ? `About: ${req.brand.about}` : "",
    req.brand.tone?.length ? `Tone: ${req.brand.tone.join(", ")}` : niche ? `Tone: ${niche.toneWords.join(", ")}` : "",
    req.brand.doSay?.length ? `Always mention: ${req.brand.doSay.join(", ")}` : "",
    req.brand.dontSay?.length ? `Never mention: ${req.brand.dontSay.join(", ")}` : "",
    `Content type: ${TYPE_GUIDE[req.type]}`,
    req.topic ? `Topic to focus on: ${req.topic}` : "",
    `Platform: ${req.brand.platforms?.[0] || niche?.platforms[0] || "Instagram"}`,
    `Write ${req.count ?? 3} distinct variations.`,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Demo generator — used when no API key is configured. */
function demoPosts(req: GenerateRequest): GeneratedPost[] {
  const niche = getNiche(req.brand.nicheId);
  const platform = req.brand.platforms?.[0] || niche?.platforms[0] || "Instagram";
  const seed = niche?.seedPosts[req.type] ?? "Here's something worth sharing today.";
  const count = req.count ?? 3;

  const variations = [seed, ...(niche ? niche.angles : []).map((a) => `${cap(a)}: ${seed}`)];

  return Array.from({ length: count }).map((_, i) => {
    const caption = personalize(variations[i % variations.length], req.brand.businessName, req.brand.city);
    return {
      type: req.type,
      platform,
      caption: stripTags(caption),
      hashtags: extractHashtags(seed, niche?.label),
      callToAction: "Learn more",
    };
  });
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function stripTags(s: string) {
  return s.replace(/#[\w]+/g, "").replace(/\s+/g, " ").trim();
}
function extractHashtags(s: string, label?: string): string[] {
  const found = (s.match(/#[\w]+/g) || []).map((h) => h.slice(1));
  if (label && !found.length) found.push(label.replace(/\s+/g, ""));
  return found.slice(0, 4);
}
function personalize(s: string, name: string, city?: string) {
  return s.replace(/\[city\]/gi, city || "your area").replace(/\[state\]/gi, "your state");
}

export async function generatePosts(req: GenerateRequest): Promise<{
  posts: GeneratedPost[];
  live: boolean;
}> {
  if (!isLive) return { posts: demoPosts(req), live: false };
  try {
    const raw = await completeJSON<any[]>({ system: buildSystem(), user: buildUser(req) });
    const posts: GeneratedPost[] = raw.map((p) => ({
      type: req.type,
      platform: p.platform || req.brand.platforms?.[0] || "Instagram",
      caption: String(p.caption || ""),
      hashtags: Array.isArray(p.hashtags) ? p.hashtags.slice(0, 4) : [],
      callToAction: p.callToAction,
    }));
    return { posts, live: true };
  } catch {
    return { posts: demoPosts(req), live: false };
  }
}

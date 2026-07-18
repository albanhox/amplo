/**
 * Planner — builds a forward calendar of content for a brand using the AI
 * agents, and writes it to the queue as scheduled posts.
 */
import { content } from "@/lib/db/repo";
import { newId } from "@/lib/db/store";
import type { Brand, ContentItem } from "@/lib/db/types";
import { generatePosts } from "@/lib/agents/contentAgent";
import type { ContentType } from "@/lib/niches";

/** Post at 9am local-ish, spacing items ~1.5 days apart. */
function scheduleAt(base: Date, index: number): string {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + Math.ceil((index + 1) * 1.5));
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export async function planContent(
  brand: Brand,
  opts: { days?: number; startAt?: Date } = {}
): Promise<{ created: ContentItem[]; live: boolean }> {
  const start = opts.startAt ?? new Date();
  const types: ContentType[] = brand.contentTypes?.length
    ? brand.contentTypes
    : ["tip", "review", "offer", "seo"];
  const platforms = brand.platforms?.length ? brand.platforms : ["Instagram"];

  const created: ContentItem[] = [];
  let live = false;
  let idx = 0;

  for (const type of types) {
    if (type === "review") continue; // review posts are event-driven, not planned
    const { posts, live: isLive } = await generatePosts({
      brand: {
        nicheId: brand.nicheId,
        businessName: brand.businessName,
        city: brand.city,
        about: brand.about,
        tone: brand.tone,
        platforms: brand.platforms,
      },
      type,
      count: 2,
    });
    live = live || isLive;

    for (const p of posts) {
      const item: ContentItem = {
        id: newId("post"),
        brandId: brand.id,
        type,
        platform: p.platform || platforms[idx % platforms.length],
        caption: p.caption,
        hashtags: p.hashtags || [],
        status: "scheduled",
        source: "planner",
        scheduledAt: scheduleAt(start, idx),
        createdAt: new Date().toISOString(),
      };
      content.upsert(item);
      created.push(item);
      idx++;
    }
  }
  return { created, live };
}

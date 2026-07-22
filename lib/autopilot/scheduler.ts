/**
 * Scheduler — the heartbeat of autopilot. One `tick()` does three jobs for
 * every brand with autopilot on:
 *
 *   1. Poll Google reviews → turn new 5★ ratings into scheduled posts.
 *   2. Top up the content queue when it runs low (via the planner).
 *   3. Publish any posts that are now due.
 *
 * Call it from a cron (see app/api/cron/tick) or the scripts/autopilot.mjs runner.
 */
import { autopilotBrands, content, reviews, unprocessedReviews, scheduledCount, duePosts, brands } from "@/lib/db/repo";
import { newId } from "@/lib/db/store";
import type { Brand, ContentItem } from "@/lib/db/types";
import { listGoogleReviews } from "@/lib/integrations/google";
import { publish } from "@/lib/integrations/publisher";
import { reviewToPost } from "@/lib/agents/reviewAgent";
import { planContent } from "./planner";

const QUEUE_FLOOR = 4; // keep at least this many scheduled posts per brand

export interface TickSummary {
  brands: number;
  newReviews: number;
  reviewPosts: number;
  planned: number;
  published: number;
  failed: number;
  actions: string[];
}

export async function tick(now: Date = new Date()): Promise<TickSummary> {
  const nowIso = now.toISOString();
  const summary: TickSummary = {
    brands: 0,
    newReviews: 0,
    reviewPosts: 0,
    planned: 0,
    published: 0,
    failed: 0,
    actions: [],
  };

  const active = await autopilotBrands();
  summary.brands = active.length;

  for (const brand of active) {
    // 1) Reviews → posts
    const fetched = await listGoogleReviews(brand.connections.google, brand.nicheId);
    for (const r of fetched) {
      const known = (await reviews.find((x) => x.brandId === brand.id && x.id === `rev_${r.externalId}`))[0];
      if (known) continue;
      const rec = await reviews.upsert({
        id: `rev_${r.externalId}`,
        brandId: brand.id,
        author: r.author,
        stars: r.stars,
        text: r.text,
        source: "google",
        receivedAt: nowIso,
        processed: false,
      });
      summary.newReviews++;

      if (rec.stars >= 4) {
        try {
          const { post } = await reviewToPost(
            { nicheId: brand.nicheId, businessName: brand.businessName, tone: brand.tone, platforms: brand.platforms },
            { author: rec.author, stars: rec.stars, text: rec.text }
          );
          const item: ContentItem = {
            id: newId("post"),
            brandId: brand.id,
            type: "review",
            platform: post.platform,
            caption: post.caption,
            hashtags: post.hashtags || [],
            status: "scheduled",
            source: "review",
            scheduledAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // ~1h out
            createdAt: nowIso,
          };
          await content.upsert(item);
          await reviews.update(rec.id, { processed: true, contentItemId: item.id });
          summary.reviewPosts++;
          summary.actions.push(`${brand.businessName}: turned ${rec.author}'s ${rec.stars}★ review into a post`);
        } catch {
          await reviews.update(rec.id, { processed: true }); // low-star or error → don't publish
        }
      } else {
        await reviews.update(rec.id, { processed: true }); // negative review → private handling only
      }
    }

    // 2) Top up the queue
    if ((await scheduledCount(brand.id)) < QUEUE_FLOOR) {
      const { created } = await planContent(brand);
      summary.planned += created.length;
      if (created.length) summary.actions.push(`${brand.businessName}: planned ${created.length} new posts`);
    }
  }

  // 3) Publish due posts (across all brands)
  for (const item of await duePosts(nowIso)) {
    const brand = await brands.get(item.brandId);
    if (!brand) continue;
    const res = await publish(brand, item);
    if (res.ok) {
      await content.update(item.id, { status: "posted", postedAt: nowIso, externalId: res.externalId });
      summary.published++;
      summary.actions.push(
        `${brand.businessName}: published ${item.type} to ${item.platform}${res.simulated ? " (simulated)" : ""}`
      );
    } else {
      await content.update(item.id, { status: "failed", error: res.error });
      summary.failed++;
    }
  }

  return summary;
}

/** Seed helper used by the demo/smoke test: flip a brand to autopilot. */
export async function enableAutopilot(brand: Brand) {
  await brands.update(brand.id, { autopilot: true });
}

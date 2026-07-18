/**
 * Publisher — routes a content item to the right platform and records the
 * result. One place the scheduler calls; it fans out to the integrations.
 */
import type { Brand, ContentItem } from "@/lib/db/types";
import { publishGoogleLocalPost } from "./google";
import { publishToMeta } from "./meta";

export interface PublishResult {
  ok: boolean;
  externalId?: string;
  simulated: boolean;
  error?: string;
}

export async function publish(brand: Brand, item: ContentItem): Promise<PublishResult> {
  const text = [item.caption, (item.hashtags || []).map((h) => `#${h}`).join(" ")]
    .filter(Boolean)
    .join("\n\n");
  const platform = item.platform.toLowerCase();

  try {
    if (platform.includes("google")) {
      const r = await publishGoogleLocalPost(brand.connections.google, text);
      return { ok: true, externalId: r.externalId, simulated: r.simulated };
    }
    if (platform.includes("facebook") || platform.includes("instagram")) {
      const r = await publishToMeta(brand.connections.meta, item.platform, text);
      return { ok: true, externalId: r.externalId, simulated: r.simulated };
    }
    // TikTok / LinkedIn: parity stubs — simulated until their APIs are wired.
    return { ok: true, externalId: `sim-${platform}-${Math.random().toString(36).slice(2, 8)}`, simulated: true };
  } catch (e) {
    return { ok: false, simulated: false, error: e instanceof Error ? e.message : "publish failed" };
  }
}

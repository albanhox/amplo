/**
 * Meta (Instagram + Facebook) integration.
 *
 * Real OAuth + Graph API publishing when META_APP_ID/SECRET and a connected
 * token exist; otherwise simulates.
 */
import type { Connection } from "@/lib/db/types";

const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI =
  process.env.META_REDIRECT_URI || "http://localhost:3000/api/connect/meta/callback";
const SCOPE =
  "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management";
const GRAPH = "https://graph.facebook.com/v19.0";

export function isMetaConfigured(): boolean {
  return Boolean(APP_ID && APP_SECRET);
}

export function metaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: APP_ID || "demo",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
}

export async function exchangeMetaCode(code: string): Promise<Connection> {
  if (!isMetaConfigured()) {
    return {
      connected: true,
      accessToken: "demo-meta-token",
      externalId: "demo-page",
      accountName: "Your Facebook Page",
      connectedAt: new Date().toISOString(),
    };
  }
  const res = await fetch(
    `${GRAPH}/oauth/access_token?` +
      new URLSearchParams({
        client_id: APP_ID!,
        client_secret: APP_SECRET!,
        redirect_uri: REDIRECT_URI,
        code,
      })
  );
  if (!res.ok) throw new Error(`Meta token exchange failed: ${res.status}`);
  const tok = (await res.json()) as { access_token: string };
  return {
    connected: true,
    accessToken: tok.access_token,
    accountName: "Meta (Facebook + Instagram)",
    connectedAt: new Date().toISOString(),
  };
}

export async function publishToMeta(
  conn: Connection | undefined,
  platform: string,
  text: string
): Promise<{ externalId: string; simulated: boolean }> {
  const live =
    isMetaConfigured() && conn?.accessToken && conn.accessToken !== "demo-meta-token" && conn.externalId;

  if (live && platform.toLowerCase().includes("facebook")) {
    try {
      const res = await fetch(`${GRAPH}/${conn!.externalId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, access_token: conn!.accessToken }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        return { externalId: data.id || rnd(), simulated: false };
      }
    } catch {
      /* fall through */
    }
  }
  // Instagram publishing is a 2-step media container flow (needs an image URL);
  // wired here for parity, simulated until creative hosting is connected.
  return { externalId: `sim-${platform.toLowerCase()}-${rnd()}`, simulated: true };
}

function rnd() {
  return Math.random().toString(36).slice(2, 10);
}

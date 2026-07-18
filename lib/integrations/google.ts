/**
 * Google Business Profile integration.
 *
 * Real OAuth + API calls when GOOGLE_CLIENT_ID/SECRET and a connected token
 * exist; otherwise every function simulates so the product runs end-to-end.
 */
import type { Connection } from "@/lib/db/types";
import { getNiche } from "@/lib/niches";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/connect/google/callback";
const SCOPE = "https://www.googleapis.com/auth/business.manage";

export function isGoogleConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID || "demo",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<Connection> {
  if (!isGoogleConfigured()) {
    // Simulated connection for demo mode.
    return {
      connected: true,
      accessToken: "demo-google-token",
      externalId: "accounts/demo/locations/demo",
      accountName: "Your Google Business",
      connectedAt: new Date().toISOString(),
    };
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
  const tok = (await res.json()) as { access_token: string; refresh_token?: string };
  return {
    connected: true,
    accessToken: tok.access_token,
    refreshToken: tok.refresh_token,
    accountName: "Google Business",
    connectedAt: new Date().toISOString(),
  };
}

export interface FetchedReview {
  author: string;
  stars: number;
  text: string;
  externalId: string;
}

export async function listGoogleReviews(
  conn: Connection | undefined,
  nicheId: string
): Promise<FetchedReview[]> {
  if (isGoogleConfigured() && conn?.accessToken && conn.accessToken !== "demo-google-token" && conn.externalId) {
    try {
      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/${conn.externalId}/reviews`,
        { headers: { Authorization: `Bearer ${conn.accessToken}` } }
      );
      if (res.ok) {
        const data = (await res.json()) as { reviews?: any[] };
        return (data.reviews || []).map((r) => ({
          author: r.reviewer?.displayName || "A customer",
          stars: STAR_MAP[r.starRating] ?? 5,
          text: r.comment || "",
          externalId: r.reviewId || r.name || cryptoRandom(),
        }));
      }
    } catch {
      /* fall through to simulated */
    }
  }
  // Simulated: surface the niche's representative review the first time.
  const niche = getNiche(nicheId);
  if (!niche) return [];
  return [
    {
      author: niche.reviewExample.author,
      stars: niche.reviewExample.stars,
      text: niche.reviewExample.text,
      externalId: `sim-${nicheId}-1`,
    },
  ];
}

export async function publishGoogleLocalPost(
  conn: Connection | undefined,
  text: string
): Promise<{ externalId: string; simulated: boolean }> {
  if (isGoogleConfigured() && conn?.accessToken && conn.accessToken !== "demo-google-token" && conn.externalId) {
    try {
      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/${conn.externalId}/localPosts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${conn.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ languageCode: "en-US", summary: text, topicType: "STANDARD" }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as { name?: string };
        return { externalId: data.name || cryptoRandom(), simulated: false };
      }
    } catch {
      /* fall through */
    }
  }
  return { externalId: `sim-gbp-${cryptoRandom()}`, simulated: true };
}

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
function cryptoRandom() {
  return Math.random().toString(36).slice(2, 10);
}

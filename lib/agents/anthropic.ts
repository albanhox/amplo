/**
 * Thin Claude wrapper used by every agent.
 *
 * If ANTHROPIC_API_KEY is set, we call the real model. If not, `isLive` is
 * false and callers fall back to the built-in demo generator — so the whole
 * product is clickable with zero configuration.
 */
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
export const isLive = Boolean(apiKey);

const model = process.env.AMPLO_MODEL || "claude-sonnet-5";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/**
 * Ask Claude for JSON matching a described shape. Returns the parsed object,
 * or throws so the caller can fall back to the demo generator.
 */
export async function completeJSON<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  if (!isLive) throw new Error("ANTHROPIC_API_KEY not set — using demo generator");

  const msg = await getClient().messages.create({
    model,
    max_tokens: opts.maxTokens ?? 1200,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Be forgiving: extract the first JSON object/array in the response.
  const match = text.match(/[\[{][\s\S]*[\]}]/);
  if (!match) throw new Error("Model did not return JSON");
  return JSON.parse(match[0]) as T;
}

export { model };

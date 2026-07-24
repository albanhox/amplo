/**
 * Thin Gemini (Google) wrapper used by every agent.
 *
 * If GEMINI_API_KEY (or GOOGLE_API_KEY) is set, we call the real model. If not,
 * `isLive` is false and callers fall back to the built-in demo generator — so
 * the whole product stays clickable with zero configuration.
 *
 * Text runs on gemini-2.5-flash; images ("nano banana") on gemini-2.5-flash-image.
 * Both model ids are env-overridable so you can bump to newer models (e.g.
 * gemini-3.1-flash-image / "Nano Banana 2") without a code change.
 */
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
export const isLive = Boolean(apiKey);

const textModel = process.env.POPD_TEXT_MODEL || "gemini-2.5-flash";
const imageModel = process.env.POPD_IMAGE_MODEL || "gemini-2.5-flash-image";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Ask Gemini for JSON matching a described shape. Returns the parsed object,
 * or throws so the caller can fall back to the demo generator.
 */
export async function completeJSON<T>(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  if (!isLive) throw new Error("GEMINI_API_KEY not set — using demo generator");

  const res = await getClient().models.generateContent({
    model: textModel,
    contents: opts.user,
    config: {
      systemInstruction: opts.system,
      responseMimeType: "application/json",
      maxOutputTokens: opts.maxTokens ?? 1200,
      temperature: 0.9,
    },
  });

  const text = res.text ?? "";
  // Be forgiving: extract the first JSON object/array in the response.
  const match = text.match(/[\[{][\s\S]*[\]}]/);
  if (!match) throw new Error("Model did not return JSON");
  return JSON.parse(match[0]) as T;
}

/**
 * Generate a branded image with the nano-banana model. Returns a data: URL the
 * frontend can render inline, or null if generation fails for any reason — so a
 * missing image never breaks post creation. (Google recently moved image
 * generation toward the Interactions API; this uses the stable generateContent
 * path. If a future SDK changes the response shape, this degrades to null.)
 */
export async function generateImage(prompt: string): Promise<{ url: string; mimeType: string } | null> {
  if (!isLive) return null;
  try {
    const res = await getClient().models.generateContent({
      model: imageModel,
      contents: prompt,
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data;
      if (data) {
        const mimeType = part.inlineData?.mimeType || "image/png";
        return { url: `data:${mimeType};base64,${data}`, mimeType };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export { textModel, imageModel };

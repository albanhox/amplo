#!/usr/bin/env node
/**
 * Closed by Friday — daily social + SEO content, sent to Telegram for review.
 *
 * Rebuild of the original CBF auto-poster. It:
 *   1. Generates a batch of on-brand social posts + local SEO ideas (Claude).
 *   2. Formats them into a clean Telegram digest.
 *   3. Sends it to your Telegram — for you to review and approve.
 *
 * SAFE BY DEFAULT: without `--send` it only prints (dry run). Nothing goes to
 * Telegram until you pass --send (or schedule it). Runs with no API key too —
 * it falls back to a built-in sample so you can see the format immediately.
 *
 * Usage:
 *   node generate.mjs                # dry run — print the digest
 *   node generate.mjs --send         # generate AND send to Telegram
 *   POSTS=6 SEO=4 node generate.mjs  # tune how many of each
 *
 * Delivery (pick one; env vars keep secrets out of the repo):
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID   send DIRECTLY via api.telegram.org
 *                                           (works from cloud/Routine environments)
 *   CBF_RELAY_URL                           send via a VPS relay instead
 *                                           (use only where the relay is reachable)
 *
 * Env:
 *   ANTHROPIC_API_KEY   live AI generation (omit → built-in sample)
 *   AMPLO_MODEL         model id (default claude-sonnet-5)
 */
import { CBF } from "./brand.mjs";

const SEND = process.argv.includes("--send");
const MODEL = process.env.AMPLO_MODEL || "claude-sonnet-5";
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;
const RELAY_URL = process.env.CBF_RELAY_URL; // optional; only if reachable
const N_POSTS = Number(process.env.POSTS || 5);
const N_SEO = Number(process.env.SEO || 3);

const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ---------- generation ----------
function systemPrompt() {
  return [
    `You write marketing content for ${CBF.name} (${CBF.url}).`,
    `What it is: ${CBF.what}`,
    `Core promise: ${CBF.promise}`,
    `Audience: ${CBF.audience}.`,
    `Voice: ${CBF.tone.join("; ")}.`,
    `Key features: ${CBF.features.join("; ")}.`,
    `Pricing: ${CBF.pricing}`,
    `Why it's different: ${CBF.differentiators.join("; ")}.`,
    "",
    "Write scroll-stopping posts that teach something real to agents/LOs first, then make the product the obvious answer. No hype, no fake urgency. Vary the angle across posts (pain-point tip, feature spotlight, honest comparison, founder/operator take, offer).",
    "Return ONLY JSON with this shape:",
    `{"social":[{"platform":"Instagram|Facebook|LinkedIn|TikTok","angle":"short label","caption":"the post","hashtags":["Tag1","Tag2"]}],"seo":[{"title":"blog/GBP title","keyword":"target keyword","angle":"one line on what to cover"}]}`,
  ].join("\n");
}

function userPrompt() {
  return `Generate ${N_POSTS} social posts and ${N_SEO} local-SEO content ideas for today (${today}). Target keywords to weave into SEO ideas: ${CBF.seoTargets.join(", ")}.`;
}

async function generateLive() {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt(),
    messages: [{ role: "user", content: userPrompt() }],
  });
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model did not return JSON");
  return JSON.parse(match[0]);
}

function sampleContent() {
  return {
    social: [
      { platform: "Instagram", angle: "Speed-to-lead tip", caption: "A lead that waits 5 minutes for a reply is basically gone. 🕐 The agents who win aren't working harder — they just answer first. Closed by Friday texts every new lead back the second they come in, automatically. That's the whole game.", hashtags: ["RealEstateTips", "SpeedToLead", "RealtorLife"] },
      { platform: "LinkedIn", angle: "Feature spotlight", caption: "Most CRMs are a graveyard where leads go to be forgotten. Closed by Friday runs the follow-up FOR you — buyer, seller, expired, and open-house sequences that stop the moment someone replies. Built inside a working mortgage shop, not a software office.", hashtags: ["MortgageMarketing", "LoanOfficers"] },
      { platform: "Facebook", angle: "Honest comparison", caption: "Paying $500+/mo for a CRM you set up yourself and barely use? Closed by Friday starts free, is flat-priced (not per seat), and comes already set up around real estate + mortgage follow-up. Same power as the big platforms, a fraction of the cost.", hashtags: ["RealEstateCRM", "FollowUpBossAlternative"] },
      { platform: "TikTok", angle: "Founder/operator take", caption: "HOOK: \"I built my own CRM because every other one wasted my leads.\" — Walk through the speed-to-lead text-back, the action plans, the AI that drafts replies from real convo history. CTA: \"Free plan, link in bio.\"", hashtags: ["RealtorTok", "MortgageTips"] },
      { platform: "Instagram", angle: "Offer", caption: "Your whole follow-up system, running itself — starting at $0. 🚀 Free forever plan, no card. Or let us run your social + ads too with the Full System bundle. One price, one team, no contracts.", hashtags: ["RealEstateMarketing", "ClosedByFriday"] },
    ],
    seo: [
      { title: "Best CRM for Solo Real Estate Agents in 2026", keyword: "best CRM for solo real estate agents", angle: "Compare on price, setup effort, and follow-up automation; position CBF as set-up-for-you and flat-priced." },
      { title: "Follow Up Boss Alternative: An Honest Side-by-Side", keyword: "Follow Up Boss alternative", angle: "Feature + price comparison with a one-step CSV migration guide." },
      { title: "Speed to Lead: Why the First 5 Minutes Decide the Deal", keyword: "speed to lead real estate", angle: "Teach the stat, then show automatic text-back as the fix." },
    ],
  };
}

// ---------- formatting ----------
function formatDigest(data) {
  const lines = [`🗓️ ${CBF.name} — content for review (${today})`, ""];
  lines.push("📱 SOCIAL POSTS");
  (data.social || []).forEach((p, i) => {
    const tags = (p.hashtags || []).map((h) => `#${h}`).join(" ");
    lines.push(`\n${i + 1}. [${p.platform} · ${p.angle || "post"}]`);
    lines.push(p.caption);
    if (tags) lines.push(tags);
  });
  lines.push("\n\n🔎 SEO / CONTENT IDEAS");
  (data.seo || []).forEach((s, i) => {
    lines.push(`\n${i + 1}. "${s.title}"`);
    lines.push(`   target: ${s.keyword}`);
    lines.push(`   angle: ${s.angle}`);
  });
  lines.push("\n\n✅ Reply 👍 to approve, or tell me what to tweak.");
  return lines.join("\n");
}

// ---------- delivery ----------
async function sendToTelegram(message) {
  // Preferred: direct Telegram Bot API over HTTPS (works from cloud/Routine envs).
  if (TG_TOKEN && TG_CHAT) {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT, text: message }),
    });
    if (!res.ok) throw new Error(`Telegram API responded ${res.status}: ${await res.text()}`);
    return "telegram-api";
  }
  // Fallback: a VPS relay, only where it's reachable.
  if (RELAY_URL) {
    const res = await fetch(RELAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`Relay responded ${res.status}`);
    return "relay";
  }
  throw new Error("No delivery configured — set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (or CBF_RELAY_URL)");
}

// ---------- main ----------
async function main() {
  let data;
  let live = false;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      data = await generateLive();
      live = true;
    } catch (e) {
      console.error(`⚠️  Live generation failed (${e.message}); using sample.`);
      data = sampleContent();
    }
  } else {
    data = sampleContent();
  }

  const digest = formatDigest(data);
  console.log("\n" + "─".repeat(60));
  console.log(digest);
  console.log("─".repeat(60) + "\n");
  console.log(`(${live ? "live AI" : "built-in sample"} · ${SEND ? "SENDING" : "dry run — pass --send to deliver"})`);

  if (SEND) {
    try {
      const via = await sendToTelegram(digest);
      console.log(`✓ Sent to Telegram (via ${via})`);
    } catch (e) {
      console.error(`✗ Send failed: ${e.message}`);
      process.exitCode = 1;
    }
  }
}

main();

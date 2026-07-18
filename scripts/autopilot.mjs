#!/usr/bin/env node
/**
 * Local autopilot runner.
 *
 * Hits the running app's cron endpoint so you can watch the engine work:
 *   1. start the app:   npm run dev
 *   2. run the loop:    node scripts/autopilot.mjs        (one tick)
 *                       node scripts/autopilot.mjs --loop (every 60s)
 *
 * In production you'd point Vercel Cron / GitHub Actions at /api/cron/tick
 * instead of running this.
 */
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SECRET = process.env.CRON_SECRET;
const loop = process.argv.includes("--loop");

async function once() {
  const url = new URL("/api/cron/tick", BASE);
  if (SECRET) url.searchParams.set("key", SECRET);
  const res = await fetch(url);
  const data = await res.json();
  const t = new Date().toLocaleTimeString();
  console.log(
    `[${t}] brands=${data.brands} newReviews=${data.newReviews} reviewPosts=${data.reviewPosts} planned=${data.planned} published=${data.published} failed=${data.failed}`
  );
  for (const a of data.actions || []) console.log(`         • ${a}`);
}

if (loop) {
  console.log("Autopilot loop started — ticking every 60s. Ctrl+C to stop.");
  await once();
  setInterval(once, 60_000);
} else {
  await once();
}

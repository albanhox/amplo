<div align="center">

# 🟠 Amplo

### Local marketing on autopilot.

**Amplo is a self-serve AI service that runs social media and local SEO for local businesses.**
Pick your niche, tell it what you want, connect Google — and it writes posts, turns your
Google reviews into content, and keeps you visible. Set it once. It runs itself.

</div>

---

## The idea

Every local service business — realtors, dentists, lawyers, med spas, contractors, gyms —
knows they *should* be posting on social and showing up on Google. Almost none of them have
the time. Agencies charge $400–1,500/mo to do it by hand.

Amplo productizes that whole job into software an owner can turn on in 10 minutes:

1. **Pick your niche** → Amplo already knows your language, best content angles, and platforms.
2. **Describe your business & voice** → it writes in *your* tone, not a robot's.
3. **Connect Google + your socials** → it pulls your real reviews and posts to your pages.
4. **Approve or automate** → a full month of content, ready. Flip on autopilot and forget it.

The headline feature: **your Google reviews become content automatically.** A new 5★ review
comes in → Amplo turns it into a branded, ready-to-publish social post that thanks the
customer and invites new ones. Word-of-mouth, on repeat.

> This is a standalone product — its own brand, sold to any local business. It was inspired by
> the auto-posting automations built for a single real-estate operation, generalized into a
> plug-and-play service any niche can subscribe to.

### Name

**Amplo** — coined from *amplify* + *local*. Short, ownable, niche-agnostic (works for a law
firm or a nail salon), and easy to say. Two alternates if you want to compare: **Mainstreet**
(warm, "marketing for Main Street") and **Everpost** (descriptive, always-on). The name lives
in one place — [`components/Logo.tsx`](components/Logo.tsx) and copy strings — so renaming is trivial.

---

## What's in this repo

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Marketing landing page — hero, live content studio, reviews→posts, pricing |
| `app/onboarding/page.tsx` | 5-step plug-and-play setup wizard (niche → voice → content → connect) |
| `app/dashboard/page.tsx` | The product: Content Studio, Calendar, Queue, Reviews, Growth |
| `app/api/generate` · `review-to-post` | Content + Review agent endpoints |
| `app/api/connect/*` | Google & Meta OAuth connect + callback routes |
| `app/api/billing/*` | Stripe checkout + webhook |
| `app/api/cron/tick` | Autopilot heartbeat (point a cron here) |
| `lib/agents/` | The AI IP — Claude-powered agents with a built-in demo fallback |
| `lib/autopilot/` | The engine — planner + scheduler that plan, convert reviews, and publish |
| `lib/integrations/` | Google Business + Meta publishing (real calls, simulated fallback) |
| `lib/billing/` | Stripe subscriptions + usage hooks (simulated without a key) |
| `lib/db/` | Swappable persistence (file-backed now; drop in Postgres for prod) |
| `lib/niches.ts` · `pricing.ts` · `brand.ts` | Niche library, plans, and the name (rename in one place) |
| `scripts/autopilot.mjs` | Local runner for the autopilot loop |
| `marketing/index.html` | **Zero-build interactive demo** — double-click to open in any browser |

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

**It works with zero configuration.** With no API key, the agents use a built-in demo
generator so you can click through the entire product. To switch on real AI, copy
`.env.example` → `.env.local` and add your Anthropic key:

```bash
ANTHROPIC_API_KEY=sk-ant-...
AMPLO_MODEL=claude-sonnet-5
```

The moment a key is present, `/api/generate` and `/api/review-to-post` return `"live": true`
and use Claude for every post.

Just want to *see* it? Open `marketing/index.html` directly — no install, fully interactive
(pick a niche, regenerate posts, browse the dashboard, toggle pricing and dark mode).

---

## The AI agents (the IP)

Each agent is a small, prompt-engineered module in `lib/agents/`. They share one Claude
wrapper (`anthropic.ts`) and every one degrades gracefully to a demo generator so the app
never hard-fails.

- **Content Agent** (`contentAgent.ts`) — writes tips, short-video scripts, offers, and local
  SEO posts. Seeded per-niche with the right vocabulary, tone, and content angles.
- **Review Agent** (`reviewAgent.ts`) — the magic feature. Converts 5★ reviews into posts.
  Reviews under 4★ are **never** auto-published — they're routed to a private reply flow.

Adding a whole new industry is one object in `lib/niches.ts`. Everything else is niche-agnostic.

---

## Autopilot engine

The heart of the product. One `tick()` (`lib/autopilot/scheduler.ts`) does three jobs for
every brand with autopilot on:

1. **Reviews → posts** — polls Google for new reviews; 5★ become scheduled posts, under-4★ are
   never published (routed to private handling).
2. **Top up the calendar** — when the queue runs low, the **planner** generates more content.
3. **Publish what's due** — hands due posts to the **publisher**, which routes each to Google /
   Meta / etc. and records the result.

Run it locally against a running app:

```bash
npm run dev
node scripts/autopilot.mjs --loop        # ticks every 60s
# or hit it directly:
curl "http://localhost:3000/api/cron/tick"
```

In production, point **Vercel Cron**, **GitHub Actions**, or any scheduler at
`GET /api/cron/tick` every 15–60 min (protect it with `CRON_SECRET`). The endpoint accepts an
optional `?now=<iso>` clock override for backfills and testing.

Verified end-to-end in simulation: a tick detected a new 5★ review → posted it, planned 6 posts,
then published all 7 on the next tick — 0 failures, and the review was de-duplicated on re-run.

---

## Pricing model

Flat monthly plans, month-to-month, plus usage-based add-ons — defined in `lib/pricing.ts`.

| Plan | Price | For |
| --- | --- | --- |
| **Starter** | $0/mo | Solo pro getting consistent — 12 posts/mo, 1 platform |
| **Growth** ⭐ | $149/mo | Full autopilot — unlimited posts, all platforms, reviews→posts |
| **Pro** | $349/mo | Teams, multi-location & agencies — white-label, 5 brands, seats |

**Usage add-ons:** extra brand/location ($79), content boost (+50 posts, $39), ad creative
pack ($59), done-for-you video editing ($25/video). Yearly billing = 2 months free.

Wire the `stripePriceId` fields in `lib/pricing.ts` to your Stripe products to go live.

---

## Going live — it's all built, just add keys

Every pillar is coded and runs today in simulation. Going live = pasting credentials into
`.env.local` — no re-architecting.

| Pillar | Status | To activate |
| --- | --- | --- |
| AI agents | ✅ built | `ANTHROPIC_API_KEY` |
| Google Business (reviews + local posts) | ✅ OAuth + API wired | `GOOGLE_CLIENT_ID` / `SECRET` |
| Meta (Instagram + Facebook) | ✅ OAuth + Graph wired | `META_APP_ID` / `SECRET` |
| Stripe billing | ✅ checkout + webhook wired | `STRIPE_SECRET_KEY` + price ids |
| Persistence | ✅ file-backed, swappable | point `lib/db` at Postgres/Supabase |
| Autopilot scheduler | ✅ built + verified | cron → `/api/cron/tick` + `CRON_SECRET` |

`.env.example` documents every variable. The moment a key is present, that pillar switches from
simulated to live automatically.

---

## Tech

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Anthropic SDK. Light/dark theme,
responsive, and no external runtime dependencies beyond the AI calls.

<div align="center"><sub>Amplo — stop posting, start growing.</sub></div>

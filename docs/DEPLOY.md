# Getting Popd live (and taking real payments)

Plain-English, click-by-click. No prior deployment experience needed. Rough time:
**~30–45 min** for a live app taking test payments; a bit more for real cards and
the social connections.

There are 4 stages. Do them in order. You can stop after Stage 2 and already have
a **live, shareable link**.

---

## Stage 1 — Put it online (Vercel) · ~10 min

Vercel hosts the app for free to start and connects straight to your GitHub.

1. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Click **Add New… → Project**.
3. Find **`albanhox/social-media-and-SEO-builder`** in the list → **Import**.
4. Vercel auto-detects Next.js. Leave everything default.
5. Click **Deploy**. Wait ~2 minutes.
6. You'll get a live URL like `https://popd-xxxx.vercel.app`. **That's your app, live.** 🎉

At this point the marketing site, the setup flow, brand kit, templates, and the
plan builder all work. AI + payments are simulated until you add keys (next stages).

> **Important — data persistence.** On Vercel the app runs "serverless," which
> does not keep the local file-based storage between visits. For a real product
> where signups and settings **stick**, you need a database. It's a clean swap
> (the code is built for it) — see Stage 4. Fine to skip while testing.

---

## Stage 2 — Turn on the real AI · ~5 min

1. Go to **https://console.anthropic.com** → sign in → **API Keys** → **Create Key**.
   Copy it (starts with `sk-ant-`).
2. In Vercel: your project → **Settings → Environment Variables**.
3. Add:
   - `ANTHROPIC_API_KEY` = your key
   - `POPD_MODEL` = `claude-sonnet-5`
4. Click **Save**, then **Deployments → ⋯ → Redeploy** (env vars apply on next deploy).

Now every post is written by real AI. The Content Studio will show **“✓ Live AI.”**

---

## Stage 3 — Take payments (Stripe) · ~15 min

Start in **Test mode** (fake cards, no real money) to prove it works, then flip to Live.

1. Go to **https://stripe.com** → create an account.
2. Keep the toggle on **Test mode** (top right) for now.
3. **Get your key:** Developers → **API keys** → copy the **Secret key** (`sk_test_…`).
4. **Create the webhook:** Developers → **Webhooks → Add endpoint**.
   - Endpoint URL: `https://YOUR-APP.vercel.app/api/billing/webhook`
   - Events to send: select `checkout.session.completed`,
     `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted`.
   - Click **Add endpoint**, then copy the **Signing secret** (`whsec_…`).
5. In Vercel → Environment Variables, add:
   - `STRIPE_SECRET_KEY` = `sk_test_…`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_…`
   - `NEXT_PUBLIC_APP_URL` = `https://YOUR-APP.vercel.app`
6. **Redeploy.**

Now finishing setup opens **real Stripe Checkout for the exact price the customer
built** (14-day free trial). Test it with Stripe's test card **4242 4242 4242 4242**,
any future date, any CVC.

**When you're ready for real money:** flip Stripe to **Live mode**, repeat steps 3–5
with the `sk_live_…` key and a new live webhook, redeploy. Done — you're charging.

> The plan prices live in `lib/pricing.ts`. Change them there anytime; no Stripe
> products to set up — Popd creates the priced subscription on the fly.

---

## Stage 4 — Make it production-real (when you have paying users)

These make it a real business, not a demo. Tackle in any order.

- **Database (so data persists).** Add **Vercel Postgres** or **Supabase** (both have
  free tiers) and point `lib/db` at it. The repositories are already abstracted, so
  it's a contained change — ask me and I'll wire it.
- **Autopilot schedule.** Already configured in `vercel.json` to run daily. To turn it
  on, add an env var `CRON_SECRET` (any long random string) — Vercel Cron uses it
  automatically. (More-frequent runs need Vercel's Pro plan.)
- **Google Business connection.** The slow one. Create a project at
  **console.cloud.google.com**, enable the **Business Profile API**, set up OAuth,
  and Google reviews → posts goes fully live. Google's review can take days.
- **Meta (Instagram/Facebook) posting.** Create an app at **developers.facebook.com**,
  request the posting permissions, and go through **App Review**. Also slow — budget
  a week or two. Until then, posts are drafted for you to publish.
- **Custom domain.** In Vercel → **Settings → Domains**, add `pop-d.com` (or whatever
  you buy). Vercel walks you through the DNS.

---

## The honest order of operations

1. **Stage 1 + 2** today → a live app with real AI you can show people.
2. **Stage 3 in test mode** → prove the whole money flow end-to-end.
3. Get **1–3 realtor/LO friends** to run through setup and give feedback.
4. **Stage 3 live + Stage 4 database** → start charging.
5. **Meta/Google approvals** in parallel (they're the long pole).

Stuck on any step? Tell me where and I'll walk you through it — or I can do the
parts that live in the code (database wiring, price changes, new features).

# Closed by Friday → Telegram (content for review)

Rebuilds the original automation you lost track of: it generates **Closed by Friday
social posts + local SEO ideas** and sends them to **your Telegram for review** — you
approve, nothing auto-publishes.

Unlike the old version (which lived only on your VPS), this one is **committed and yours** —
edit the brand, the angles, or the cadence anytime.

## Files

| File | What it is |
| --- | --- |
| `generate.mjs` | The runnable job — generates the digest and (optionally) sends it |
| `brand.mjs` | Closed by Friday brand facts the content is built from — **edit this to change the messaging** |
| `SKILL.md` | The same job as an editable prompt, for running as a scheduled Claude agent (no hosting/API key needed) |

## Run it

```bash
# Dry run — just print the digest (sends nothing):
node automations/closed-by-friday-telegram/generate.mjs

# Generate AND send to your Telegram:
node automations/closed-by-friday-telegram/generate.mjs --send

# Tune the batch size:
POSTS=6 SEO=4 node automations/closed-by-friday-telegram/generate.mjs
```

**Safe by default:** without `--send` it never touches Telegram. It also runs with no
API key — it falls back to a built-in sample so you can see the exact format. Add
`ANTHROPIC_API_KEY` for live, fresh generation each day.

### Environment

| Var | Purpose | Default |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Live AI generation | *(sample if unset)* |
| `AMPLO_MODEL` | Model id | `claude-sonnet-5` |
| `CBF_RELAY_URL` | Telegram relay send endpoint | your VPS relay `…:5055/send` |
| `POSTS` / `SEO` | How many of each to generate | `5` / `3` |

It sends through your existing Telegram **relay** (the same one your morning briefing
uses) — it never calls `api.telegram.org` directly, so no bot token lives in this repo.

## Schedule it (make it automatic again)

**Option A — a scheduled Claude agent (recommended, matches your other Telegram jobs).**
Run `SKILL.md` as a daily Routine. No API key or server needed — the Claude session
generates the content and curls your relay. (Ask and I'll create the Routine for you.)

**Option B — cron on any machine that has this repo + Node:**
```cron
# 8:00 AM daily — generate and send CBF content for review
0 8 * * *  cd /path/to/repo && ANTHROPIC_API_KEY=sk-ant-... node automations/closed-by-friday-telegram/generate.mjs --send
```

## The review loop

You get the digest in Telegram → reply 👍 to approve or say what to change → post the
approved ones (or, once you connect Google/Meta in Amplo, let it publish for you).

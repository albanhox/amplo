import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { StudioPreview } from "@/components/StudioPreview";
import { PricingCards } from "@/components/PricingCards";
import { Wordmark } from "@/components/Logo";
import { NICHES, CONTENT_TYPES } from "@/lib/niches";

const STEPS = [
  { n: 1, h: "Tell it about you", p: "Choose your niche and describe your business, offers, and the vibe you want. Amplo builds a brand voice that sounds like you — not a robot." },
  { n: 2, h: "Connect your accounts", p: "Link Google Business, Instagram, and Facebook in a couple of clicks. Amplo pulls in your real Google reviews and posts to your pages." },
  { n: 3, h: "Approve & autopilot", p: "A full month of content shows up ready to go. Approve with one tap — or let it post on its own. You stay visible without lifting a finger." },
];

/**
 * TODO: swap these placeholder quotes for your REAL customers' words before you
 * send the site out. Keep the shape the same — quote, name, role.
 */
const TESTIMONIALS = [
  { quote: "I went from posting once a month to every day — without touching a thing. Two listing leads came straight from Instagram last week.", name: "Marcus", role: "Realtor · Philadelphia" },
  { quote: "It turns my closings and reviews into posts automatically. My past clients keep seeing me, and referrals are up.", name: "Jasmine", role: "Loan Officer · South Jersey" },
  { quote: "Setup took five minutes and it sounds exactly like me. Cheaper than the agency I fired — and more consistent.", name: "Devin", role: "Realtor · Cherry Hill" },
];

const FAQS = [
  { q: "Do I have to write or design anything?", a: "No. You pick your niche and vibe once, and Amplo writes the captions, designs the posts with your logo and colors, and schedules everything. You just approve — or let autopilot handle it." },
  { q: "Will it really post for me automatically?", a: "Yes. On a paid plan you can connect Instagram, Facebook, and Google Business and switch on autopilot, or keep approval-first control. Free accounts can preview content but can't publish." },
  { q: "What happens with my Google reviews?", a: "Connect Google Business and Amplo watches for new reviews. Every 5-star review is automatically turned into a branded post that thanks the customer and invites new ones." },
  { q: "Do I need to be tech-savvy?", a: "Not at all. Setup takes about a minute — pick your role, add your name and market, choose your look, done. It's built for busy agents and loan officers, not marketers." },
  { q: "Can I cancel anytime?", a: "Yes. Every plan is month-to-month with a 14-day free trial. Cancel from your account settings whenever you like — no contracts." },
  { q: "Will the posts actually look like my brand?", a: "Yes. Upload your logo, set your brand color, pick your templates, and add your own photos. Every post comes out on-brand." },
];

export default function Home() {
  const demoNiche = NICHES[0];

  return (
    <>
      <SiteNav />

      {/* HERO */}
      <section style={{ padding: "64px 0 40px" }}>
        <div className="wrap grid-2">
          <div>
            <span className="eyebrow"><span className="pulse" /> AI marketing on autopilot</span>
            <h1 style={{ fontSize: "clamp(38px,5.6vw,62px)", letterSpacing: "-.04em", lineHeight: 1.05, fontWeight: 800, marginTop: 16, textWrap: "balance" }}>
              Your whole marketing team, <span style={{ color: "var(--brand)" }}>in one tab.</span>
            </h1>
            <p style={{ fontSize: "clamp(17px,1.7vw,20px)", color: "var(--muted)", marginTop: 22, maxWidth: 520, fontWeight: 500 }}>
              Amplo runs social media and local SEO for your business automatically — writing posts, turning your Google
              reviews into content, and keeping you visible. Pick your niche, set it once, and it just runs.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn btn-primary">Start free — no card →</Link>
              <a href="#how" className="btn btn-ghost">See how it works</a>
            </div>
            <div style={{ marginTop: 26, fontSize: 13, color: "var(--faint)", fontWeight: 600 }}>
              <span style={{ color: "var(--gold)", letterSpacing: 1 }}>★★★★★</span>&nbsp; Built for realtors, dentists, lawyers &amp; local pros
            </div>
          </div>
          <StudioPreview />
        </div>
      </section>

      {/* NICHE STRIP */}
      <div style={{ borderTop: "1px solid var(--line-2)", borderBottom: "1px solid var(--line-2)", background: "var(--surface-2)" }}>
        <div className="wrap" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", padding: "20px 22px" }}>
          {NICHES.map((n) => (
            <span key={n.id} style={{ fontSize: 13.5, fontWeight: 700, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 17 }}>{n.emoji}</span>
              {n.label}s
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "76px 0" }}>
        <div className="wrap">
          <SectionHead eyebrow="Plug & play" title="Live in 10 minutes. Then it runs itself." sub="No agency retainer, no content calendar to fill in, no “what do I post today?” Amplo learns your business once and takes it from there." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 20 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="card" style={{ padding: 26 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", fontWeight: 850, fontSize: 15, marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ fontSize: 19, letterSpacing: "-.02em", fontWeight: 800 }}>{s.h}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 9, fontWeight: 500 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS → POSTS */}
      <section id="reviews" style={{ padding: "20px 0 76px" }}>
        <div className="wrap">
          <div style={{ background: "var(--spruce)", color: "#eaf1ec", borderRadius: 28, padding: "clamp(28px,4vw,52px)", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 34, alignItems: "center" }}>
              <div>
                <span className="eyebrow" style={{ color: "#ffb59e" }}>The magic feature</span>
                <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.4vw,38px)", letterSpacing: "-.03em", marginTop: 12, fontWeight: 800 }}>
                  Your happy customers already write your best ads.
                </h2>
                <p style={{ color: "rgba(234,241,236,.78)", marginTop: 14, fontSize: 16, fontWeight: 500 }}>
                  Amplo connects to Google Business, watches for new reviews, and automatically turns your 5-star ratings
                  into scroll-stopping social posts — with your branding, a thank-you to the customer, and a call to action.
                  Word-of-mouth, on repeat.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: "15px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", opacity: .7, marginBottom: 8 }}>New Google review</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#4285F4", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{demoNiche.reviewExample.initials}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800 }}>{demoNiche.reviewExample.author}</div>
                      <div style={{ color: "var(--gold)", fontSize: 12 }}>★★★★★</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, opacity: .92 }}>“{demoNiche.reviewExample.text}”</div>
                </div>
                <div style={{ alignSelf: "center", color: "var(--brand)" }}>↓</div>
                <div style={{ background: "#fff", color: "var(--ink)", borderRadius: 16, padding: "15px 16px", boxShadow: "0 30px 60px -20px rgba(0,0,0,.4)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 8 }}>✨ Amplo post — ready to publish</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, fontWeight: 500 }}>{demoNiche.reviewExample.generatedPost}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT TYPES */}
      <section style={{ padding: "20px 0 76px" }}>
        <div className="wrap">
          <SectionHead eyebrow="One engine, every format" title="Tell Amplo what you want. It makes all of it." sub="Mix and match what your business needs. Amplo handles the writing, the design direction, the hashtags, and the schedule." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
            {CONTENT_TYPES.map((t) => (
              <div key={t.id} className="card" style={{ padding: 22 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 14, background: "var(--brand-soft)" }}>{t.emoji}</div>
                <h3 style={{ fontSize: 17, letterSpacing: "-.02em", fontWeight: 800 }}>{t.label}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, fontWeight: 500 }}>{t.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "20px 0 76px" }}>
        <div className="wrap">
          <SectionHead eyebrow="Loved by local pros" title="Consistent marketing, finally handled." sub="What realtors and loan officers say once Amplo is running in the background." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ color: "var(--gold)", fontSize: 15, letterSpacing: 1 }}>★★★★★</div>
                <p style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.55, flex: 1 }}>“{t.quote}”</p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(145deg,var(--spruce),var(--spruce-2))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15 }}>{t.name.slice(0, 1)}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "20px 0 76px" }}>
        <div className="wrap">
          <SectionHead eyebrow="Pricing" title="Flat monthly plans. Cancel anytime." sub="Start free. Upgrade when you’re ready for more content and full autopilot. Every plan is month-to-month — no contracts, no per-seat games." />
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "20px 0 76px" }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <SectionHead eyebrow="FAQ" title="Everything you’re wondering." sub="Short answers to what realtors and loan officers ask most." />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((f) => (
              <details key={f.q} className="card" style={{ padding: "16px 20px" }}>
                <summary style={{ fontWeight: 750, fontSize: 15.5, cursor: "pointer", listStyle: "none" }}>{f.q}</summary>
                <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 10, fontWeight: 500, lineHeight: 1.6 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "20px 0 76px" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", background: "linear-gradient(180deg, var(--surface-2), var(--surface))", border: "1px solid var(--line)", borderRadius: 28, padding: "clamp(34px,5vw,64px)" }}>
            <span className="eyebrow"><span className="pulse" /> Set it once</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,46px)", letterSpacing: "-.035em", marginTop: 14, fontWeight: 800, textWrap: "balance" }}>Stop posting. Start growing.</h2>
            <p style={{ color: "var(--muted)", fontSize: 17, margin: "16px auto 0", maxWidth: 520, fontWeight: 500 }}>
              Give Amplo 10 minutes today, and never worry about your marketing again. Your first month of content is on us.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn btn-primary">Start free — no card →</Link>
              <a href="#how" className="btn btn-ghost">Book a walkthrough</a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line-2)", padding: "40px 0", marginTop: 20 }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", fontSize: 13.5, color: "var(--faint)", fontWeight: 600 }}>
          <Wordmark size={24} />
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <a href="#how">How it works</a>
            <a href="#reviews">Reviews → Posts</a>
            <a href="#pricing">Pricing</a>
            <a href="#">FAQ</a>
            <a href="mailto:hello@amplo.co">Contact</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <div>© {new Date().getFullYear()} Amplo · Local marketing on autopilot.</div>
        </div>
      </footer>
    </>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto 46px", textAlign: "center" }}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", letterSpacing: "-.035em", marginTop: 14, fontWeight: 800, textWrap: "balance" }}>{title}</h2>
      <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 14, fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

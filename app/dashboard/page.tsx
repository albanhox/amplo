"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NICHES, getNiche, type ContentType } from "@/lib/niches";
import type { BrandProfile, GeneratedPost } from "@/lib/agents/types";

type Tab = "studio" | "calendar" | "queue" | "reviews" | "growth";

const DEFAULT_BRAND: BrandProfile = {
  nicheId: "realtor",
  businessName: "Hoxha Realty",
  city: "Philadelphia, PA",
  platforms: ["Instagram", "Facebook", "Google Business"],
};

export default function Dashboard() {
  const [brand, setBrand] = useState<BrandProfile>(DEFAULT_BRAND);
  const [tab, setTab] = useState<Tab>("studio");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("amplo-brand");
      if (raw) setBrand({ ...DEFAULT_BRAND, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const niche = getNiche(brand.nicheId) || NICHES[0];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line-2)", position: "sticky", top: 0, background: "var(--bg)", zIndex: 40 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, maxWidth: 1180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/"><Wordmark /></Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 750, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 12px" }}>
              <span className="pulse" /> Autopilot on
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>{brand.businessName}</span>
            <ThemeToggle />
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(145deg,var(--spruce),var(--spruce-2))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>
              {(niche.sample.initials)}
            </span>
          </div>
        </div>
      </header>

      <div className="wrap" style={{ maxWidth: 1180, width: "100%", flex: 1, padding: "26px 22px 60px" }}>
        {/* tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
          {([
            ["studio", "✨ Content Studio"],
            ["calendar", "📅 Calendar"],
            ["queue", "🗂️ Queue"],
            ["reviews", "⭐ Reviews"],
            ["growth", "📈 Growth"],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>{label}</button>
          ))}
        </div>

        {tab === "studio" && <Studio brand={brand} />}
        {tab === "calendar" && <Calendar />}
        {tab === "queue" && <Queue niche={niche} />}
        {tab === "reviews" && <Reviews brand={brand} />}
        {tab === "growth" && <Growth />}
      </div>
    </div>
  );
}

/* ---------------- Content Studio ---------------- */
function Studio({ brand }: { brand: BrandProfile }) {
  const [type, setType] = useState<ContentType>("tip");
  const [topic, setTopic] = useState("");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, type, topic, count: 3 }),
      });
      const data = await res.json();
      setPosts(data.posts || []);
      setLive(data.live);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); /* eslint-disable-next-line */ }, []);

  const TYPES: [ContentType, string][] = [["tip", "💡 Tip"], ["video", "🎬 Video"], ["review", "⭐ Review"], ["offer", "🎁 Offer"], ["seo", "🔎 SEO"]];

  return (
    <div className="grid-studio">
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Create content</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
          {TYPES.map(([id, label]) => (
            <button key={id} onClick={() => setType(id)} className={`chip${type === id ? " on" : ""}`} style={{ cursor: "pointer" }}>{label}</button>
          ))}
        </div>
        <label style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Topic (optional)</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. spring market, new service"
          style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 14, fontFamily: "inherit", marginTop: 6 }} />
        <button onClick={run} disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
          {loading ? "Writing…" : "Generate 3 posts"}
        </button>
        <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600, marginTop: 12, textAlign: "center" }}>
          {live === false && "Demo generator (add ANTHROPIC_API_KEY for live AI)"}
          {live === true && "✓ Live AI"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.length === 0 && !loading && <div className="card" style={{ padding: 30, color: "var(--faint)", textAlign: "center" }}>Generate to see posts.</div>}
        {posts.map((p, i) => <PostCard key={i} post={p} brand={brand} />)}
      </div>
    </div>
  );
}

function PostCard({ post, brand }: { post: GeneratedPost; brand: BrandProfile }) {
  const niche = getNiche(brand.nicheId) || NICHES[0];
  const [status, setStatus] = useState<"draft" | "scheduled">("draft");
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--line-2)" }}>
        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(145deg,var(--spruce),var(--spruce-2))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{niche.sample.initials}</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800 }}>{brand.businessName}</div>
          <div style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600 }}>{post.platform} · Draft</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: "var(--brand)", background: "var(--brand-soft)", borderRadius: 7, padding: "3px 9px", textTransform: "capitalize" }}>{post.type}</span>
      </div>
      <div style={{ padding: 14, fontSize: 14.5, lineHeight: 1.55, fontWeight: 500 }}>
        {post.caption}{" "}
        {post.hashtags?.length ? <span style={{ color: "var(--brand)", fontWeight: 700 }}>{post.hashtags.map((h) => `#${h}`).join(" ")}</span> : null}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "11px 14px", borderTop: "1px solid var(--line-2)" }}>
        <button onClick={() => setStatus("scheduled")} className="btn btn-primary" style={{ padding: "7px 13px", fontSize: 13 }}>
          {status === "scheduled" ? "✓ Scheduled" : "Approve & schedule"}
        </button>
        <button className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: 13 }}>Edit</button>
      </div>
    </div>
  );
}

/* ---------------- Calendar ---------------- */
function Calendar() {
  const plan: Record<number, [string, string]> = {
    2: ["spruce", "Tip"], 4: ["brand", "Reel"], 5: ["#4285F4", "★ Review"], 6: ["gold", "Offer"],
    9: ["spruce", "Tip"], 11: ["brand", "Reel"], 13: ["#4285F4", "★ Review"],
    16: ["spruce", "Tip"], 18: ["gold", "Offer"], 20: ["brand", "Reel"],
    23: ["spruce", "Tip"], 25: ["#4285F4", "★ Review"], 27: ["brand", "Reel"],
  };
  const bg = (k: string) => (k === "spruce" ? "var(--spruce)" : k === "brand" ? "var(--brand)" : k === "gold" ? "var(--gold)" : k);
  return (
    <div>
      <KpiRow items={[["Scheduled", "28", "this month"], ["Platforms", "4", "IG · FB · GBP · TikTok"], ["Approvals left", "3", "30 sec to clear"], ["Autopilot", "On", "since Jan 4"]]} />
      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 800, color: "var(--faint)", textTransform: "uppercase", textAlign: "center", paddingBottom: 4 }}>{d}</div>
          ))}
          {Array.from({ length: 28 }).map((_, idx) => {
            const day = idx + 1;
            const p = plan[day];
            return (
              <div key={day} style={{ aspectRatio: "1 / .92", border: "1px solid var(--line-2)", borderRadius: 10, padding: 7, fontSize: 11, fontWeight: 700, color: "var(--faint)", position: "relative", background: "var(--surface-2)", overflow: "hidden" }}>
                {day}
                {p && (
                  <span style={{ position: "absolute", left: 6, right: 6, bottom: 6, borderRadius: 6, fontSize: 9.5, fontWeight: 800, padding: "3px 5px", color: p[0] === "gold" ? "#3a2c05" : "#fff", background: bg(p[0]), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p[1]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Queue ---------------- */
function Queue({ niche }: { niche: (typeof NICHES)[number] }) {
  const items = [
    { ic: "💡", bg: "var(--spruce)", t: "Tip — " + niche.seedPosts.tip.slice(0, 44) + "…", s: "Instagram · Tomorrow 9:00 AM", st: "st-sched", stl: "Scheduled" },
    { ic: "🎬", bg: "var(--brand)", t: "Short video script", s: "TikTok + Reels · Thu 12:00 PM", st: "st-draft", stl: "Needs approval" },
    { ic: "⭐", bg: "#4285F4", t: "Review spotlight: " + niche.reviewExample.author, s: "Facebook · Fri 5:00 PM", st: "st-sched", stl: "Scheduled" },
    { ic: "🎁", bg: "var(--gold)", t: "Offer — " + niche.seedPosts.offer.slice(0, 40) + "…", s: "GBP + IG · Sat 10:00 AM", st: "st-live", stl: "Posting now" },
    { ic: "🔎", bg: "var(--spruce)", t: "Google Business post — weekly local SEO", s: "Google Business · Sun 8:00 AM", st: "st-sched", stl: "Scheduled" },
  ];
  const stColor: Record<string, [string, string]> = {
    "st-sched": ["var(--good)", "var(--good-soft)"],
    "st-draft": ["var(--gold)", "rgba(228,163,44,.14)"],
    "st-live": ["var(--brand)", "var(--brand-soft)"],
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 14px" }}>
          <span style={{ width: 42, height: 42, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 18, background: it.bg, color: "#fff", flex: "none" }}>{it.ic}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.t}</div>
            <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600, marginTop: 2 }}>{it.s}</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: "5px 10px", borderRadius: 7, whiteSpace: "nowrap", color: stColor[it.st][0], background: stColor[it.st][1] }}>{it.stl}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Reviews ---------------- */
function Reviews({ brand }: { brand: BrandProfile }) {
  const niche = getNiche(brand.nicheId) || NICHES[0];
  const [generated, setGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function turn() {
    setLoading(true);
    try {
      const res = await fetch("/api/review-to-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, review: { author: niche.reviewExample.author, stars: 5, text: niche.reviewExample.text } }),
      });
      const data = await res.json();
      const p = data.post;
      setGenerated(p ? `${p.caption} ${(p.hashtags || []).map((h: string) => "#" + h).join(" ")}` : null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#4285F4", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>{niche.reviewExample.initials}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{niche.reviewExample.author}</div>
            <div style={{ color: "var(--gold)", fontSize: 12 }}>★★★★★</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: "var(--faint)" }}>via Google</span>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>“{niche.reviewExample.text}”</div>
        <button onClick={turn} disabled={loading} className="btn btn-primary" style={{ marginTop: 14, padding: "8px 14px", fontSize: 13 }}>
          {loading ? "Creating…" : "✨ Turn into a post"}
        </button>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 10 }}>Ready-to-publish post</div>
        {generated ? (
          <div style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{generated}</div>
        ) : (
          <div style={{ color: "var(--faint)", fontSize: 14 }}>Click “Turn into a post” to watch Amplo convert a 5★ review into a branded post.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Growth ---------------- */
function Growth() {
  const reach = [8, 9, 8.5, 11, 10, 13, 15, 14, 18, 22, 21, 27, 31, 30, 36, 42];
  const W = 620, H = 150;
  const max = Math.max(...reach), min = Math.min(...reach);
  const line = reach.map((v, i) => `${i ? "L" : "M"}${((i / (reach.length - 1)) * W).toFixed(1)} ${(H - 8 - ((v - min) / (max - min)) * (H - 26)).toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  return (
    <div>
      <KpiRow items={[["Reach", "42.8k", "▲ 31%"], ["New followers", "+614", "▲ 22%"], ["Profile clicks", "1,204", "▲ 18%"], ["Leads / calls", "37", "▲ 9"]]} />
      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 160, overflow: "visible" }} role="img" aria-label="Reach growth">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--brand)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="112" x2={W} y2="112" stroke="var(--line-2)" />
          <line x1="0" y1="74" x2={W} y2="74" stroke="var(--line-2)" />
          <line x1="0" y1="36" x2={W} y2="36" stroke="var(--line-2)" />
          <path d={area} fill="url(#g1)" />
          <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--good)", marginTop: 10 }}>● Autopilot started — steady climb in reach and engagement.</div>
      </div>
    </div>
  );
}

/* ---------------- shared ---------------- */
function KpiRow({ items }: { items: [string, string, string][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
      {items.map(([lab, val, delta]) => (
        <div key={lab} className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 750, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".05em" }}>{lab}</div>
          <div style={{ fontSize: 24, fontWeight: 850, letterSpacing: "-.03em", marginTop: 5, fontVariantNumeric: "tabular-nums" }}>{val}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--good)", marginTop: 3 }}>{delta}</div>
        </div>
      ))}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 13.5,
    fontWeight: 750,
    padding: "9px 15px",
    borderRadius: 10,
    color: active ? "#fff" : "var(--muted)",
    background: active ? "var(--brand)" : "var(--surface)",
    border: `1px solid ${active ? "var(--brand)" : "var(--line)"}`,
    cursor: "pointer",
  };
}

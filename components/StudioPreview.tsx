"use client";

import { useEffect, useState } from "react";
import { NICHES } from "@/lib/niches";
import type { GeneratedPost } from "@/lib/agents/types";

/**
 * Live content studio used on the landing page. Picks a niche, calls the real
 * /api/generate endpoint (which falls back to the demo generator with no key),
 * and renders the post the way it looks in-feed.
 */
export function StudioPreview() {
  const [nicheIdx, setNicheIdx] = useState(0);
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);

  const niche = NICHES[nicheIdx];

  async function generate(idx = nicheIdx) {
    const n = NICHES[idx];
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: { nicheId: n.id, businessName: n.sample.name, platforms: n.platforms },
          type: "tip",
          count: 1,
        }),
      });
      const data = await res.json();
      setPost(data.posts?.[0] ?? null);
    } catch {
      setPost({ type: "tip", platform: n.platforms[0], caption: n.seedPosts.tip, hashtags: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generate(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card" style={{ overflow: "hidden", boxShadow: "var(--lg2, 0 30px 60px -20px rgba(20,25,18,.28))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--line-2)", background: "var(--surface-2)" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: "var(--line)" }} />
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: "var(--faint)", fontWeight: 600, background: "var(--surface-3)", padding: "4px 12px", borderRadius: 20 }}>
          app.popd.co/studio
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".09em", textTransform: "uppercase", color: "var(--faint)" }}>
            Content Studio
          </span>
          <button
            onClick={() => generate()}
            disabled={loading}
            style={{ border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontWeight: 750, fontSize: 13, padding: "8px 14px", borderRadius: 10, cursor: "pointer" }}
          >
            {loading ? "Writing…" : "↻ Regenerate"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
          {NICHES.map((n, i) => (
            <button
              key={n.id}
              onClick={() => { setNicheIdx(i); generate(i); }}
              className={`chip${i === nicheIdx ? " on" : ""}`}
              style={{ cursor: "pointer" }}
            >
              <span style={{ fontSize: 14 }}>{n.emoji}</span>
              {n.label}
            </button>
          ))}
        </div>

        <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--line-2)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(145deg, var(--spruce), var(--spruce-2))", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
              {niche.sample.initials}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{niche.sample.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600 }}>{niche.sample.handle} · Just now</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 800, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 7, padding: "3px 8px" }}>
              {post?.platform ?? niche.platforms[0]}
            </span>
          </div>
          <div style={{ padding: 14, fontSize: 14.5, lineHeight: 1.55, fontWeight: 500, minHeight: 92 }}>
            {post?.caption ?? "…"}{" "}
            {post?.hashtags?.length ? (
              <span style={{ color: "var(--brand)", fontWeight: 700 }}>{post.hashtags.map((h) => `#${h}`).join(" ")}</span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "11px 14px", borderTop: "1px solid var(--line-2)", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700 }}>♥ 128</span>
            <span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 700 }}>↗ 24</span>
            <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 800, color: "var(--good)", background: "var(--good-soft)", padding: "5px 10px", borderRadius: 8 }}>
              Auto-scheduled ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

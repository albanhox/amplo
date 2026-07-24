"use client";

import { useEffect, useRef, useState } from "react";
import type { BrandProfile } from "@/lib/agents/types";
import { getNiche } from "@/lib/niches";
import { templatesForRole, defaultTemplateIds, type Template } from "@/lib/templates";

interface BrandRecord {
  id: string;
  nicheId: string;
  businessName: string;
  accent?: string;
  logoDataUrl?: string;
  templateIds?: string[];
  media?: { id: string; dataUrl?: string; note?: string }[];
}

const ACCENTS = ["#EE5A36", "#2E9E6B", "#3B82F6", "#8B5CF6", "#E4A32C", "#0E7490", "#DB2777"];

export function BrandKit({ brand }: { brand: BrandProfile }) {
  const [rec, setRec] = useState<BrandRecord | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      let id = localStorage.getItem("amplo-brand-id");
      if (!id) {
        try {
          const res = await fetch("/api/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(brand),
          });
          id = (await res.json()).brandId;
          if (id) localStorage.setItem("amplo-brand-id", id);
        } catch {}
      }
      if (id) {
        setBrandId(id);
        try {
          const r = await fetch(`/api/brands?id=${id}`);
          if (r.ok) {
            const b = (await r.json()).brand as BrandRecord;
            if (!b.templateIds) b.templateIds = defaultTemplateIds(b.nicheId);
            setRec(b);
          }
        } catch {}
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(p: Partial<BrandRecord>) {
    setRec((cur) => (cur ? { ...cur, ...p } : cur));
    if (!brandId) return;
    try {
      await fetch("/api/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: brandId, ...p }),
      });
    } catch {}
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => patch({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  }

  function onMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6);
    let done = 0;
    const added: { id: string; dataUrl: string }[] = [];
    files.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        added.push({ id: `m_${Date.now()}_${i}`, dataUrl: String(reader.result) });
        if (++done === files.length) patch({ media: [...(rec?.media || []), ...added] });
      };
      reader.readAsDataURL(f);
    });
  }

  function toggleTemplate(id: string) {
    const cur = rec?.templateIds || [];
    patch({ templateIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  }

  function removeMedia(id: string) {
    patch({ media: (rec?.media || []).filter((m) => m.id !== id) });
  }

  const niche = getNiche(rec?.nicheId || brand.nicheId);
  const accent = rec?.accent || "#EE5A36";
  const templates = templatesForRole(rec?.nicheId || brand.nicheId);
  const selected = rec?.templateIds || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Brand kit */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 850, fontSize: 16 }}>Brand kit</div>
        <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, marginTop: 3, marginBottom: 16 }}>
          Your logo and colors get applied to every post automatically.
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          {/* logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: rec?.logoDataUrl ? "var(--surface-2)" : accent, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid var(--line)" }}>
              {rec?.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rec.logoDataUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ color: "#fff", fontWeight: 850, fontSize: 24 }}>{(rec?.businessName || "A").slice(0, 1)}</span>
              )}
            </div>
            <div>
              <button onClick={() => logoInput.current?.click()} className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
                {rec?.logoDataUrl ? "Change logo" : "Upload logo"}
              </button>
              {rec?.logoDataUrl && (
                <button onClick={() => patch({ logoDataUrl: undefined })} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13, marginLeft: 8 }}>Remove</button>
              )}
              <input ref={logoInput} type="file" accept="image/*" onChange={onLogo} style={{ display: "none" }} />
              <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600, marginTop: 6 }}>PNG or SVG, square works best</div>
            </div>
          </div>
          {/* accent */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 750, color: "var(--faint)", marginBottom: 8 }}>Brand color</div>
            <div style={{ display: "flex", gap: 8 }}>
              {ACCENTS.map((c) => (
                <button key={c} onClick={() => patch({ accent: c })} aria-label={c}
                  style={{ width: 32, height: 32, borderRadius: 9, background: c, border: "2px solid var(--surface)", boxShadow: accent === c ? `0 0 0 2px ${c}` : "0 0 0 1px var(--line)", cursor: "pointer" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 850, fontSize: 16 }}>Post templates</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, marginTop: 3 }}>
              Pick the looks you like — Popd rotates through your selected templates.
            </div>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: accent, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 12px" }}>{selected.length} selected</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 14, marginTop: 16 }}>
          {templates.map((t) => (
            <TemplateCard key={t.id} t={t} accent={accent} logo={rec?.logoDataUrl} photo={rec?.media?.[0]?.dataUrl} businessName={rec?.businessName || brand.businessName} niche={niche?.label || ""} on={selected.includes(t.id)} onToggle={() => toggleTemplate(t.id)} />
          ))}
        </div>
      </div>

      {/* Your images */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 850, fontSize: 16 }}>Your photos & inspiration</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, marginTop: 3 }}>
              Add listing photos, your headshot, or posts you liked. Popd uses these in your designs.
            </div>
          </div>
          <button onClick={() => mediaInput.current?.click()} className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 13.5 }}>+ Upload images</button>
          <input ref={mediaInput} type="file" accept="image/*" multiple onChange={onMedia} style={{ display: "none" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: 10, marginTop: 16 }}>
          {(rec?.media || []).map((m) => (
            <div key={m.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.dataUrl && <img src={m.dataUrl} alt="upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              <button onClick={() => removeMedia(m.id)} aria-label="Remove" style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
            </div>
          ))}
          {(!rec?.media || rec.media.length === 0) && (
            <button onClick={() => mediaInput.current?.click()} style={{ aspectRatio: "1/1", borderRadius: 12, border: "2px dashed var(--line)", background: "var(--surface-2)", color: "var(--faint)", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "grid", placeItems: "center" }}>
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- a single template preview card (mini post mockup) ---- */
function TemplateCard({ t, accent, logo, photo, businessName, niche, on, onToggle }: { t: Template; accent: string; logo?: string; photo?: string; businessName: string; niche: string; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ textAlign: "left", cursor: "pointer", border: `2px solid ${on ? accent : "var(--line)"}`, borderRadius: 14, overflow: "hidden", background: "var(--surface)", padding: 0, transition: "border-color .15s, transform .15s", position: "relative" }}>
      {on && <span style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 22, height: 22, borderRadius: "50%", background: accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900 }}>✓</span>}
      <div style={{ aspectRatio: "1/1", ...renderStyle(t, accent), display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 12, position: "relative", overflow: "hidden" }}>
        <Preview t={t} accent={accent} logo={logo} photo={photo} niche={niche} />
      </div>
      <div style={{ padding: "9px 11px", borderTop: "1px solid var(--line-2)" }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{t.name}</div>
        <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600 }}>{t.category}</div>
      </div>
    </button>
  );
}

function renderStyle(t: Template, accent: string): React.CSSProperties {
  const bg = t.style.bg === "var(--brand)" ? accent : t.style.bg.replace("var(--brand)", accent);
  return { background: bg, color: t.style.fg };
}

function Preview({ t, accent, logo, photo, niche }: { t: Template; accent: string; logo?: string; photo?: string; niche: string }) {
  const logoEl = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt="" style={{ height: 16, maxWidth: 60, objectFit: "contain" }} />
  ) : (
    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".08em", opacity: 0.9 }}>YOUR LOGO</span>
  );
  const photoBox = (h: string) => (
    <div style={{ height: h, borderRadius: 8, background: photo ? undefined : "rgba(255,255,255,.18)", overflow: "hidden", display: "grid", placeItems: "center" }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 16, opacity: 0.5 }}>🏡</span>
      )}
    </div>
  );

  switch (t.style.layout) {
    case "stat-hero":
      return (
        <>
          {logoEl}
          <div><div style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.03em", color: accent }}>18</div><div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>avg days on market</div></div>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.7 }}>{niche} · market update</div>
        </>
      );
    case "quote":
      return (
        <>
          {logoEl}
          <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3 }}>“Marry the house, date the rate.”</div>
          <div style={{ height: 4, width: 30, background: accent, borderRadius: 3 }} />
        </>
      );
    case "badge":
      return (
        <>
          <div style={{ alignSelf: "flex-start", background: "#fff", color: accent, fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 6, letterSpacing: ".06em" }}>{t.category.toUpperCase()}</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Free pre-approval this week</div>
          {logoEl}
        </>
      );
    case "photo-full":
      return (
        <div style={{ position: "absolute", inset: 0 }}>
          {photoBox("100%")}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 10, background: "linear-gradient(transparent, rgba(0,0,0,.7))", color: "#fff" }}>
            <div style={{ fontSize: 12, fontWeight: 900 }}>$425,000</div>
            <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>3 bd · 2 ba · Just listed</div>
          </div>
        </div>
      );
    case "photo-bottom":
      return (
        <>
          <div style={{ alignSelf: "flex-start", background: "#fff", color: accent, fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 6 }}>JUST LISTED</div>
          {photoBox("48%")}
          {logoEl}
        </>
      );
    case "split":
      return (
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {photoBox("100%")}
          <div style={{ padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {logoEl}
            <div style={{ fontSize: 11, fontWeight: 800 }}>3 things to fix before you list 👇</div>
            <div style={{ height: 4, width: 24, background: accent, borderRadius: 3 }} />
          </div>
        </div>
      );
    default:
      return <>{logoEl}</>;
  }
}

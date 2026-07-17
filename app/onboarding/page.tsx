"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NICHES, CONTENT_TYPES, type ContentType } from "@/lib/niches";

const TONES = ["Warm", "Professional", "Playful", "Bold", "Reassuring", "Luxury", "No-nonsense"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "Google Business", "LinkedIn"];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nicheId, setNicheId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");
  const [tone, setTone] = useState<string[]>([]);
  const [types, setTypes] = useState<ContentType[]>(["tip", "review", "offer"]);
  const [platforms, setPlatforms] = useState<string[]>(["Instagram", "Facebook", "Google Business"]);

  const steps = ["Your business", "Your voice", "What to post", "Connect", "You're set"];
  const niche = NICHES.find((n) => n.id === nicheId);

  function toggle<T>(arr: T[], v: T, set: (x: T[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  function finish() {
    const brand = { nicheId, businessName, city, about, tone, platforms, types };
    try {
      localStorage.setItem("amplo-brand", JSON.stringify(brand));
    } catch {}
    router.push("/dashboard");
  }

  const canNext =
    (step === 0 && nicheId && businessName.trim()) ||
    (step === 1 && tone.length) ||
    (step === 2 && types.length && platforms.length) ||
    step === 3 ||
    step === 4;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/"><Wordmark /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600 }}>Step {step + 1} of {steps.length}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* progress */}
      <div style={{ height: 4, background: "var(--surface-3)" }}>
        <div style={{ height: "100%", width: `${((step + 1) / steps.length) * 100}%`, background: "var(--brand)", transition: "width .3s" }} />
      </div>

      <main className="wrap" style={{ flex: 1, maxWidth: 720, padding: "48px 22px 80px", width: "100%" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--brand)" }}>{steps[step]}</div>

        {step === 0 && (
          <div>
            <H>Let’s set up your marketing.</H>
            <P>Pick your industry — this teaches Amplo your language, your best content angles, and where to post.</P>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 10, marginTop: 24 }}>
              {NICHES.map((n) => (
                <button key={n.id} onClick={() => { setNicheId(n.id); if (!businessName) setBusinessName(""); }} className="card"
                  style={{ padding: 16, textAlign: "left", cursor: "pointer", borderColor: nicheId === n.id ? "var(--brand)" : "var(--line)", background: nicheId === n.id ? "var(--brand-soft)" : "var(--surface)" }}>
                  <div style={{ fontSize: 26 }}>{n.emoji}</div>
                  <div style={{ fontWeight: 800, marginTop: 6 }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>{n.audience}</div>
                </button>
              ))}
            </div>
            <Field label="Business name" style={{ marginTop: 24 }}>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={niche?.sample.name || "Your business"} style={inputStyle} />
            </Field>
            <Field label="City (for local SEO)">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Philadelphia, PA" style={inputStyle} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <H>How should you sound?</H>
            <P>Amplo writes in your voice. Pick a few words that describe your brand — you can fine-tune anytime.</P>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
              {TONES.map((t) => (
                <button key={t} onClick={() => toggle(tone, t, setTone)} className={`chip${tone.includes(t) ? " on" : ""}`} style={{ cursor: "pointer", padding: "10px 16px", fontSize: 14 }}>{t}</button>
              ))}
            </div>
            <Field label="Anything Amplo should know? (offers, personality, what makes you different)" style={{ marginTop: 28 }}>
              <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} placeholder="e.g. We’re a family-owned practice, gentle with nervous patients, first cleaning free for new patients." style={{ ...inputStyle, resize: "vertical" }} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <H>What do you want Amplo to make?</H>
            <P>Choose the content types and platforms. Amplo builds a full calendar around your picks.</P>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--faint)", marginTop: 24, marginBottom: 10 }}>CONTENT</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
              {CONTENT_TYPES.map((t) => (
                <button key={t.id} onClick={() => toggle(types, t.id, setTypes)} className="card"
                  style={{ padding: 14, textAlign: "left", cursor: "pointer", borderColor: types.includes(t.id) ? "var(--brand)" : "var(--line)", background: types.includes(t.id) ? "var(--brand-soft)" : "var(--surface)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{t.emoji}</span>
                  <span><span style={{ fontWeight: 800, fontSize: 14 }}>{t.label}</span><br /><span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 500 }}>{t.blurb}</span></span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 750, color: "var(--faint)", marginTop: 24, marginBottom: 10 }}>PLATFORMS</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PLATFORMS.map((p) => (
                <button key={p} onClick={() => toggle(platforms, p, setPlatforms)} className={`chip${platforms.includes(p) ? " on" : ""}`} style={{ cursor: "pointer", padding: "10px 16px", fontSize: 14 }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <H>Connect your accounts.</H>
            <P>This is what makes it automatic — Amplo pulls your Google reviews and posts straight to your pages. (Demo: connections are simulated.)</P>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              <ConnectRow name="Google Business" desc="Read reviews · publish local posts" color="#4285F4" letter="G" />
              <ConnectRow name="Instagram" desc="Publish posts, reels & stories" color="#E4405F" letter="I" />
              <ConnectRow name="Facebook" desc="Publish to your business page" color="#1877F2" letter="F" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 54 }}>🎉</div>
            <H>You’re set, {businessName || "friend"}.</H>
            <P style={{ marginInline: "auto" }}>Amplo is building your first month of content right now. Head to your dashboard to review the calendar and flip on autopilot.</P>
            <div style={{ display: "inline-flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={finish} className="btn btn-primary">Go to my dashboard →</button>
            </div>
          </div>
        )}

        {/* nav buttons */}
        {step < 4 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="btn btn-ghost" style={{ visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn btn-primary" style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed" }}>
              {step === 3 ? "Finish setup" : "Continue"} →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: "clamp(26px,3.4vw,36px)", letterSpacing: "-.03em", fontWeight: 800, marginTop: 10 }}>{children}</h1>;
}
function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 10, fontWeight: 500, maxWidth: 520, ...style }}>{children}</p>;
}
function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: "block", marginTop: 16, ...style }}>
      <span style={{ fontSize: 13, fontWeight: 750, color: "var(--muted)" }}>{label}</span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 15,
  fontFamily: "inherit",
};

function ConnectRow({ name, desc, color, letter }: { name: string; desc: string; color: string; letter: string }) {
  const [connected, setConnected] = useState(false);
  return (
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>{letter}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600 }}>{desc}</div>
      </div>
      <button onClick={() => setConnected(true)} className={connected ? "btn btn-ghost" : "btn btn-primary"} style={{ padding: "8px 16px", fontSize: 13.5 }}>
        {connected ? "✓ Connected" : "Connect"}
      </button>
    </div>
  );
}

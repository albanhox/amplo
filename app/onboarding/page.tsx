"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SETUP_ROLES, VOICES, FREQUENCIES, getSetupRole } from "@/lib/setupConfig";
import { PlanBuilder } from "@/components/PlanBuilder";
import { useAuth } from "@/components/useAuth";
import { computeQuote, defaultSelection, type QuoteSelection, type Quote } from "@/lib/pricing";

/**
 * Amplo setup — built for realtors & loan officers, and kept dead simple:
 * mostly one-tap choices, only two things to type, smart defaults everywhere.
 */
export default function Onboarding() {
  const router = useRouter();
  const { account, loading } = useAuth({ required: true, redirectTo: "/signup", next: "/onboarding" });
  const [step, setStep] = useState(0);

  const [roleId, setRoleId] = useState<string>("");
  const [businessName, setBusinessName] = useState("");
  const [market, setMarket] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [voice, setVoice] = useState("friendly");
  const [frequency, setFrequency] = useState("grow");
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [planSel, setPlanSel] = useState<QuoteSelection>(defaultSelection(5, 3));
  const [quote, setQuote] = useState<Quote>(() => computeQuote(defaultSelection(5, 3)));

  const role = getSetupRole(roleId);
  const steps = ["You", "Business", "Content", "Style", "Plan", "Connect"];

  // choosing a role seeds its default themes and auto-advances
  function chooseRole(id: string) {
    const r = getSetupRole(id);
    setRoleId(id);
    setThemes(r ? r.themes.filter((t) => t.on).map((t) => t.id) : []);
    setStep(1);
  }

  function toggleTheme(id: string) {
    setThemes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const canContinue =
    (step === 1 && businessName.trim().length > 0) || (step === 2 && themes.length > 0);

  // moving into the Plan step: seed the builder from earlier choices
  function goToPlan() {
    const perWeek = FREQUENCIES.find((f) => f.id === frequency)?.perWeek ?? 5;
    const platforms = role?.defaultPlatforms.length ?? 3;
    const seed = { ...defaultSelection(perWeek, platforms), postsPerWeek: perWeek, platforms };
    setPlanSel(seed);
    setQuote(computeQuote(seed));
    setStep(4);
  }

  async function finish() {
    if (!role) return;
    const themeLabels = role.themes.filter((t) => themes.includes(t.id)).map((t) => t.label);
    const voiceLabel = VOICES.find((v) => v.id === voice)?.label ?? "Friendly";
    const perWeek = FREQUENCIES.find((f) => f.id === frequency)?.perWeek ?? 5;

    const brand = {
      nicheId: role.nicheId,
      businessName: businessName.trim(),
      city: market.trim(),
      tone: [voiceLabel],
      platforms: role.defaultPlatforms,
      contentTypes: ["tip", "review", "offer", "seo"],
      about: `Focus topics: ${themeLabels.join(", ")}. Voice: ${voiceLabel}. Posting ${perWeek}x/week.`,
      themes: themeLabels,
      postsPerWeek: perWeek,
      planMonthly: quote.monthly,
    };
    try {
      localStorage.setItem("amplo-brand", JSON.stringify(brand));
    } catch {}
    setSaving(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      const data = await res.json();
      if (data.brandId) localStorage.setItem("amplo-brand-id", data.brandId);
    } catch {
      /* dashboard still works from localStorage */
    }
    // Start the subscription for the chosen amount (14-day trial). Simulated
    // without a Stripe key; opens real Stripe Checkout once keys are set.
    try {
      const co = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMonthly: quote.monthly, label: `Amplo — ${role.label} (${quote.baseLabel})` }),
      });
      const cod = await co.json();
      router.push(cod.url || "/dashboard?welcome=1");
    } catch {
      router.push("/dashboard?welcome=1");
    }
  }

  if (loading || !account) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--faint)", fontWeight: 600 }}>Loading…</div>;
  }

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

      <div style={{ height: 4, background: "var(--surface-3)" }}>
        <div style={{ height: "100%", width: `${((step + 1) / steps.length) * 100}%`, background: "var(--brand)", transition: "width .3s" }} />
      </div>

      <main className="wrap" style={{ flex: 1, maxWidth: 680, padding: "44px 22px 80px", width: "100%" }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--brand)" }}>{steps[step]}</div>

        {/* STEP 0 — role */}
        {step === 0 && (
          <div>
            <H>What do you do?</H>
            <P>Amplo is built for real estate and mortgage pros. Pick one and we’ll set everything up around it.</P>
            <div style={{ display: "grid", gap: 12, marginTop: 26 }}>
              {SETUP_ROLES.map((r) => (
                <button key={r.id} onClick={() => chooseRole(r.id)} className="card"
                  style={{ padding: 22, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 18 }}>
                  <span style={{ fontSize: 40, lineHeight: 1 }}>{r.emoji}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontWeight: 850, fontSize: 20, display: "block" }}>{r.label}</span>
                    <span style={{ color: "var(--muted)", fontSize: 14, fontWeight: 500 }}>{r.blurb}</span>
                  </span>
                  <span style={{ color: "var(--brand)", fontSize: 22, fontWeight: 800 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — business basics */}
        {step === 1 && role && (
          <div>
            <H>Tell us about you.</H>
            <P>Just two things — this personalizes every post. Takes 15 seconds.</P>
            <Field label={role.id === "loanOfficer" ? "Your name or team" : "Your name or brokerage"} style={{ marginTop: 26 }}>
              <input autoFocus value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={role.id === "loanOfficer" ? "e.g. Alex Rivera — Summit Home Lending" : "e.g. Alex Rivera — Keller Williams"} style={inputStyle} />
            </Field>
            <Field label="Your market / city (for local reach)">
              <input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="e.g. Philadelphia, PA" style={inputStyle} />
            </Field>
            <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} canNext={canContinue} />
          </div>
        )}

        {/* STEP 2 — content themes */}
        {step === 2 && role && (
          <div>
            <H>What should Amplo post about?</H>
            <P>We pre-picked the winners for {role.label.toLowerCase()}s. Tap to add or remove — you can change these anytime.</P>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px,1fr))", gap: 10, marginTop: 24 }}>
              {role.themes.map((t) => {
                const on = themes.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggleTheme(t.id)} className="card"
                    style={{ padding: 14, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 11, borderColor: on ? "var(--brand)" : "var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
                    <span style={{ fontSize: 20 }}>{t.emoji}</span>
                    <span style={{ flex: 1, fontWeight: 750, fontSize: 14 }}>{t.label}</span>
                    <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", background: on ? "var(--brand)" : "transparent", border: on ? "none" : "1.5px solid var(--line)", color: "#fff", fontSize: 13, fontWeight: 900 }}>{on ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
            <NavRow onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={canContinue} />
          </div>
        )}

        {/* STEP 3 — voice + frequency */}
        {step === 3 && (
          <div>
            <H>How should it sound — and how often?</H>
            <P>Set the vibe and the pace. Amplo handles the rest.</P>

            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--faint)", marginTop: 26, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>Voice</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10 }}>
              {VOICES.map((v) => {
                const on = voice === v.id;
                return (
                  <button key={v.id} onClick={() => setVoice(v.id)} className="card"
                    style={{ padding: 14, textAlign: "center", cursor: "pointer", borderColor: on ? "var(--brand)" : "var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
                    <div style={{ fontSize: 22 }}>{v.emoji}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{v.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 500 }}>{v.hint}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--faint)", marginTop: 26, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>How often</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10 }}>
              {FREQUENCIES.map((f) => {
                const on = frequency === f.id;
                return (
                  <button key={f.id} onClick={() => setFrequency(f.id)} className="card"
                    style={{ padding: 16, textAlign: "left", cursor: "pointer", position: "relative", borderColor: on ? "var(--brand)" : "var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
                    {f.recommended && <span style={{ position: "absolute", top: -9, right: 12, background: "var(--brand)", color: "#fff", fontSize: 10, fontWeight: 850, textTransform: "uppercase", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 999 }}>Recommended</span>}
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{f.label}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{f.hint}</div>
                  </button>
                );
              })}
            </div>
            <NavRow onBack={() => setStep(2)} onNext={goToPlan} canNext />
          </div>
        )}

        {/* STEP 4 — choice-based plan */}
        {step === 4 && role && (
          <div>
            <H>Build your plan.</H>
            <P>You only pay for what you pick. Adjust anything — the price updates live. Start with a 14-day free trial.</P>
            <div style={{ marginTop: 24 }}>
              <PlanBuilder initial={planSel} onChange={(s, q) => { setPlanSel(s); setQuote(q); }} />
            </div>
            <NavRow onBack={() => setStep(3)} onNext={() => setStep(5)} canNext />
          </div>
        )}

        {/* STEP 5 — connect + finish */}
        {step === 5 && role && (
          <div>
            <H>Last step — connect your accounts.</H>
            <P>This is what makes it automatic: Amplo pulls your Google reviews and posts to your pages. (Demo: connections are simulated.)</P>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              <ConnectRow name="Google Business" desc="Reviews + local posts" color="#4285F4" letter="G" done={!!connected.google} onDone={() => setConnected((c) => ({ ...c, google: true }))} />
              <ConnectRow name="Instagram" desc="Posts, reels & stories" color="#E4405F" letter="I" done={!!connected.ig} onDone={() => setConnected((c) => ({ ...c, ig: true }))} />
              <ConnectRow name="Facebook" desc="Your business page" color="#1877F2" letter="F" done={!!connected.fb} onDone={() => setConnected((c) => ({ ...c, fb: true }))} />
            </div>

            <div className="card" style={{ padding: 16, marginTop: 22, background: "var(--surface-2)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>
                You can skip connecting for now and still see your first week of posts. Connect later from the dashboard to turn on full autopilot.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
              <button onClick={() => setStep(4)} className="btn btn-ghost">← Back</button>
              <button onClick={finish} disabled={saving} className="btn btn-primary" style={{ minWidth: 210, justifyContent: "center" }}>
                {saving ? "Setting up…" : `Start free trial → $${quote.monthly}/mo`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- small pieces ---------- */
function H({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontSize: "clamp(26px,3.6vw,36px)", letterSpacing: "-.03em", fontWeight: 800, marginTop: 10, textWrap: "balance" }}>{children}</h1>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 10, fontWeight: 500, maxWidth: 520 }}>{children}</p>;
}
function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{ display: "block", marginTop: 16, ...style }}>
      <span style={{ fontSize: 13, fontWeight: 750, color: "var(--muted)" }}>{label}</span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}
function NavRow({ onBack, onNext, canNext }: { onBack: () => void; onNext: () => void; canNext: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
      <button onClick={onBack} className="btn btn-ghost">← Back</button>
      <button onClick={onNext} disabled={!canNext} className="btn btn-primary" style={{ opacity: canNext ? 1 : 0.5, cursor: canNext ? "pointer" : "not-allowed", minWidth: 130, justifyContent: "center" }}>Continue →</button>
    </div>
  );
}
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 15px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 15.5,
  fontFamily: "inherit",
};

function ConnectRow({ name, desc, color, letter, done, onDone }: { name: string; desc: string; color: string; letter: string; done: boolean; onDone: () => void }) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>{letter}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600 }}>{desc}</div>
      </div>
      <button onClick={onDone} className={done ? "btn btn-ghost" : "btn btn-primary"} style={{ padding: "8px 16px", fontSize: 13.5 }}>
        {done ? "✓ Connected" : "Connect"}
      </button>
    </div>
  );
}

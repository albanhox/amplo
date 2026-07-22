"use client";

import { useEffect, useState } from "react";
import { FREQUENCY_TIERS, PRICE_OPTIONS, computeQuote, type QuoteSelection, type Quote } from "@/lib/pricing";

/**
 * Choice-based plan builder. The customer toggles what they want and the price
 * updates live. Emits the current selection + computed quote to the parent.
 */
export function PlanBuilder({
  initial,
  onChange,
}: {
  initial: QuoteSelection;
  onChange?: (sel: QuoteSelection, quote: Quote) => void;
}) {
  const [sel, setSel] = useState<QuoteSelection>(initial);
  const quote = computeQuote(sel);

  useEffect(() => {
    onChange?.(sel, quote);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  function set<K extends keyof QuoteSelection>(k: K, v: QuoteSelection[K]) {
    setSel((s) => ({ ...s, [k]: v }));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,300px)", gap: 20, alignItems: "start" }} className="grid-studio">
      {/* controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <SubLabel>Posting frequency</SubLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {FREQUENCY_TIERS.map((t) => {
              const on = sel.postsPerWeek === t.perWeek;
              return (
                <button key={t.perWeek} onClick={() => set("postsPerWeek", t.perWeek)} className="card"
                  style={{ padding: "12px 8px", textAlign: "center", cursor: "pointer", borderColor: on ? "var(--brand)" : "var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
                  <div style={{ fontWeight: 850, fontSize: 15 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600 }}>{t.perWeek}/week · ${t.price}</div>
                </button>
              );
            })}
          </div>
        </div>

        <Stepper label="Platforms" hint={`${3} included, then $${PRICE_OPTIONS.extraPlatform}/mo each`} value={sel.platforms} min={1} max={6} onChange={(v) => set("platforms", v)} />

        <Toggle label="Full autopilot" hint="Auto-publish (vs. approve-first)" price={PRICE_OPTIONS.autopilot} on={sel.autopilot} onToggle={() => set("autopilot", !sel.autopilot)} />
        <Toggle label="Short-video scripts" hint="Ready-to-film Reels/TikTok" price={PRICE_OPTIONS.videoScripts} on={sel.videoScripts} onToggle={() => set("videoScripts", !sel.videoScripts)} />
        <Toggle label="Done-for-you design & media" hint="We build the graphics" price={PRICE_OPTIONS.dfyDesign} on={sel.dfyDesign} onToggle={() => set("dfyDesign", !sel.dfyDesign)} />
        <Toggle label="Ad creative pack" hint="Paid-ad creatives monthly" price={PRICE_OPTIONS.adCreative} on={sel.adCreative} onToggle={() => set("adCreative", !sel.adCreative)} />

        <Stepper label="Extra brands / locations" hint={`$${PRICE_OPTIONS.extraBrand}/mo each — for teams & agencies`} value={sel.extraBrands} min={0} max={20} onChange={(v) => set("extraBrands", v)} />
      </div>

      {/* live quote */}
      <div className="card" style={{ padding: 18, position: "sticky", top: 80 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)" }}>Your plan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "14px 0" }}>
          {quote.lines.map((l) => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: l.included ? "var(--faint)" : "var(--ink)", fontWeight: 550 }}>
              <span>{l.label}</span>
              <span style={{ fontWeight: 700, color: l.included ? "var(--good)" : "var(--ink)" }}>{l.included ? "Included" : `$${l.amount}`}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--line-2)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
          <span style={{ fontWeight: 850, fontSize: 30, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>
            ${quote.monthly}<span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>/mo</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 600, marginTop: 8 }}>Month-to-month. Cancel anytime. 14-day free trial.</div>
      </div>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 9 }}>{children}</div>;
}

function Toggle({ label, hint, price, on, onToggle }: { label: string; hint: string; price: number; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left", borderColor: on ? "var(--brand)" : "var(--line)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 750, fontSize: 14.5 }}>{label} <span style={{ color: "var(--muted)", fontWeight: 700 }}>+${price}/mo</span></div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 550 }}>{hint}</div>
      </div>
      <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? "var(--brand)" : "var(--surface-3)", position: "relative", transition: ".15s", flex: "none" }}>
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: ".15s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
      </span>
    </button>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 750, fontSize: 14.5 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 550 }}>{hint}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StepBtn onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</StepBtn>
        <span style={{ minWidth: 20, textAlign: "center", fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        <StepBtn onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</StepBtn>
      </div>
    </div>
  );
}
function StepBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 18, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, display: "grid", placeItems: "center" }}>
      {children}
    </button>
  );
}

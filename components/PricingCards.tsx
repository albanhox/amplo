"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS } from "@/lib/pricing";

export function PricingCards() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", background: "var(--surface-3)", borderRadius: 12, padding: 4, marginTop: 20 }}>
          <button
            onClick={() => setYearly(false)}
            style={toggleStyle(!yearly)}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            style={toggleStyle(yearly)}
          >
            Yearly <span style={{ fontSize: 11, color: "var(--good)", fontWeight: 800, marginLeft: 4 }}>2 months free</span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginTop: 38,
          alignItems: "start",
          maxWidth: 900,
          marginInline: "auto",
        }}
      >
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearlyMonthly : plan.monthly;
          return (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: 26,
                position: "relative",
                ...(plan.featured
                  ? { borderColor: "var(--brand)", boxShadow: "0 20px 50px -22px rgba(238,90,54,.5)" }
                  : {}),
              }}
            >
              {plan.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--brand)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 850,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    padding: "5px 13px",
                    borderRadius: 999,
                  }}
                >
                  Most popular
                </span>
              )}
              <div style={{ fontSize: 14, fontWeight: 850, letterSpacing: ".02em", textTransform: "uppercase", color: plan.featured ? "var(--brand)" : "var(--muted)" }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, marginTop: 4, minHeight: 34 }}>{plan.tagline}</div>
              <div style={{ fontSize: 42, fontWeight: 850, letterSpacing: "-.04em", marginTop: 12, fontVariantNumeric: "tabular-nums" }}>
                ${price}
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)", letterSpacing: 0 }}>/mo</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 24px", display: "flex", flexDirection: "column", gap: 11 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, fontWeight: 550, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 2 }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className={plan.featured ? "btn btn-primary" : "btn btn-ghost"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: "center", marginTop: 26, color: "var(--faint)", fontSize: 13.5, fontWeight: 600 }}>
        Need more than one brand? Usage-based add-ons let you scale content volume, platforms, and locations à la carte — you only pay for what you run.
      </p>
    </div>
  );
}

function toggleStyle(active: boolean): React.CSSProperties {
  return {
    border: "none",
    background: active ? "var(--surface)" : "transparent",
    padding: "9px 18px",
    borderRadius: 9,
    fontWeight: 750,
    fontSize: 13.5,
    color: active ? "var(--ink)" : "var(--muted)",
    boxShadow: active ? "0 1px 2px rgba(20,25,18,.05), 0 10px 30px -12px rgba(20,25,18,.16)" : "none",
    cursor: "pointer",
  };
}

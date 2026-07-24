"use client";

import { useEffect, useState } from "react";

export interface TourStep {
  id: string;
  label: string;
  hint: string;
  tab?: string;
}

const STEPS: TourStep[] = [
  { id: "business", label: "Set up your business", hint: "Done during signup ✓" },
  { id: "brand", label: "Add your logo & pick templates", hint: "Make posts look like your brand", tab: "brand" },
  { id: "connect", label: "Connect Google, Instagram & Facebook", hint: "So Popd can post & pull reviews", tab: "settings" },
  { id: "approve", label: "Review & approve your first post", hint: "See what Popd wrote for you", tab: "studio" },
  { id: "autopilot", label: "Turn on autopilot", hint: "Set it and forget it", tab: "settings" },
];

export function GettingStarted({ onGoto, name }: { onGoto: (tab: string) => void; name?: string }) {
  const [done, setDone] = useState<string[]>(["business"]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("amplo-tour");
      if (raw) {
        const p = JSON.parse(raw);
        setDone(p.done?.length ? p.done : ["business"]);
        setDismissed(!!p.dismissed);
      }
    } catch {}
  }, []);

  function persist(nextDone: string[], nextDismissed = dismissed) {
    try {
      localStorage.setItem("amplo-tour", JSON.stringify({ done: nextDone, dismissed: nextDismissed }));
    } catch {}
  }

  function complete(id: string, tab?: string) {
    const nd = done.includes(id) ? done : [...done, id];
    setDone(nd);
    persist(nd);
    if (tab) onGoto(tab);
  }

  if (dismissed) return null;

  const pct = Math.round((done.length / STEPS.length) * 100);
  const allDone = done.length === STEPS.length;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 22, position: "relative", overflow: "hidden" }}>
      <button
        onClick={() => { setDismissed(true); persist(done, true); }}
        aria-label="Dismiss"
        style={{ position: "absolute", top: 12, right: 12, width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--muted)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
      >×</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>{allDone ? "🎉" : "👋"}</span>
        <div>
          <div style={{ fontWeight: 850, fontSize: 17 }}>{allDone ? "You're all set up!" : `Welcome${name ? `, ${name.split(" ")[0]}` : ""} — let's get you rolling`}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{allDone ? "Autopilot will keep your marketing running." : "5 quick steps to your marketing on autopilot."}</div>
        </div>
      </div>

      {/* progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 16px" }}>
        <div style={{ flex: 1, height: 7, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--brand)", transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)" }}>{done.length}/{STEPS.length}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STEPS.map((s) => {
          const isDone = done.includes(s.id);
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line-2)", background: isDone ? "var(--good-soft)" : "var(--surface-2)" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: isDone ? "var(--good)" : "var(--surface)", border: isDone ? "none" : "1.5px solid var(--line)", color: "#fff", fontSize: 13, fontWeight: 900 }}>{isDone ? "✓" : ""}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 750, textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.7 : 1 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--faint)", fontWeight: 550 }}>{s.hint}</div>
              </div>
              {!isDone && s.tab && (
                <button onClick={() => complete(s.id, s.tab)} className="btn btn-primary" style={{ padding: "7px 14px", fontSize: 13 }}>Go →</button>
              )}
              {!isDone && !s.tab && (
                <button onClick={() => complete(s.id)} className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 13 }}>Mark done</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

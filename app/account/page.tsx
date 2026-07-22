"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/useAuth";

export default function AccountPage() {
  const { account, loading, logout } = useAuth({ required: true, redirectTo: "/login", next: "/account" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<{ plan: string; status: string } | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name || "");
      setEmail(account.email);
      setPlan({ plan: account.plan, status: account.subscriptionStatus });
    }
  }, [account]);

  if (loading || !account) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--faint)", fontWeight: 600 }}>Loading…</div>;
  }

  async function saveProfile() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
      const d = await res.json();
      setMsg(res.ok ? { kind: "ok", text: "Profile saved." } : { kind: "err", text: d.error || "Couldn't save." });
    } finally { setBusy(false); }
  }

  async function savePassword() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }) });
      const d = await res.json();
      if (res.ok) { setMsg({ kind: "ok", text: "Password updated." }); setCurPw(""); setNewPw(""); }
      else setMsg({ kind: "err", text: d.error || "Couldn't update password." });
    } finally { setBusy(false); }
  }

  async function cancelSub() {
    if (!confirm("Cancel your subscription? Autopilot will pause at the end of your period.")) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const d = await res.json();
      if (res.ok) { setPlan({ plan: d.account.plan, status: d.account.subscriptionStatus }); setMsg({ kind: "ok", text: "Subscription canceled." }); }
    } finally { setBusy(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/dashboard"><Wordmark /></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>← Dashboard</Link>
            <ThemeToggle />
            <button onClick={logout} className="btn btn-ghost" style={{ padding: "8px 13px", fontSize: 13 }}>Log out</button>
          </div>
        </div>
      </header>

      <main className="wrap" style={{ flex: 1, maxWidth: 640, padding: "40px 22px 80px", width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
        <h1 style={{ fontSize: 30, letterSpacing: "-.03em", fontWeight: 800 }}>Account</h1>

        {msg && (
          <div style={{ fontSize: 14, fontWeight: 650, borderRadius: 11, padding: "11px 14px", color: msg.kind === "ok" ? "var(--good)" : "#D2503A", background: msg.kind === "ok" ? "var(--good-soft)" : "rgba(210,80,58,.1)", border: `1px solid ${msg.kind === "ok" ? "var(--good)" : "rgba(210,80,58,.3)"}` }}>{msg.text}</div>
        )}

        {/* Profile */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 850, fontSize: 16, marginBottom: 14 }}>Profile</div>
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
          <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></Field>
          <button onClick={saveProfile} disabled={busy} className="btn btn-primary" style={{ marginTop: 14 }}>Save profile</button>
        </div>

        {/* Password */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 850, fontSize: 16, marginBottom: 14 }}>Password</div>
          <Field label="Current password"><input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} style={inputStyle} autoComplete="current-password" /></Field>
          <Field label="New password"><input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" style={inputStyle} autoComplete="new-password" /></Field>
          <button onClick={savePassword} disabled={busy || !newPw} className="btn btn-primary" style={{ marginTop: 14 }}>Update password</button>
        </div>

        {/* Plan */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 850, fontSize: 16, marginBottom: 6 }}>Plan &amp; billing</div>
          <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 550 }}>
            Current plan: <b style={{ color: "var(--ink)", textTransform: "capitalize" }}>{plan?.plan}</b> · status: <b style={{ color: "var(--ink)", textTransform: "capitalize" }}>{plan?.status}</b>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn btn-ghost">Change plan in dashboard</Link>
            {plan?.status !== "canceled" && plan?.status !== "none" && (
              <button onClick={cancelSub} disabled={busy} className="btn btn-ghost" style={{ color: "#D2503A", borderColor: "rgba(210,80,58,.3)" }}>Cancel subscription</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginTop: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 750, color: "var(--muted)" }}>{label}</span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 11, border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--ink)", fontSize: 15, fontFamily: "inherit",
};

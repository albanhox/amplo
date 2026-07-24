"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || (mode === "signup" ? "/onboarding" : "/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setBusy(false);
        return;
      }
      router.push(next);
    } catch {
      setError("Network error — please try again.");
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--line-2)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link href="/"><Wordmark /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, textAlign: "center" }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, textAlign: "center", marginTop: 8, fontWeight: 500 }}>
            {isSignup ? "Start your free trial — no card required." : "Log in to your Popd dashboard."}
          </p>

          <form onSubmit={submit} className="card" style={{ padding: 24, marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {isSignup && (
              <Field label="Your name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" style={inputStyle} autoComplete="name" />
              </Field>
            )}
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" style={inputStyle} autoComplete="email" />
            </Field>
            <Field label="Password">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? "At least 8 characters" : "Your password"} style={inputStyle} autoComplete={isSignup ? "new-password" : "current-password"} />
            </Field>

            {error && (
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#D2503A", background: "rgba(210,80,58,.1)", border: "1px solid rgba(210,80,58,.3)", borderRadius: 10, padding: "10px 12px" }}>{error}</div>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {busy ? "Please wait…" : isSignup ? "Create account →" : "Log in →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>
            {isSignup ? (
              <>Already have an account? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 700 }}>Log in</Link></>
            ) : (
              <>New to Popd? <Link href="/signup" style={{ color: "var(--brand)", fontWeight: 700 }}>Create an account</Link></>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ fontSize: 13, fontWeight: 750, color: "var(--muted)" }}>{label}</span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 11,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink)",
  fontSize: 15,
  fontFamily: "inherit",
};

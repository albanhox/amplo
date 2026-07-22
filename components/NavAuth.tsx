"use client";

import Link from "next/link";
import { useAuth } from "./useAuth";

/** Auth-aware nav buttons: Dashboard when logged in, else Log in + Start free. */
export function NavAuth() {
  const { account, loading } = useAuth();

  if (loading) return <span style={{ width: 130 }} />;

  if (account) {
    return (
      <Link href="/dashboard" className="btn btn-primary" style={{ padding: "9px 15px", fontSize: 13.5 }}>
        Dashboard
      </Link>
    );
  }
  return (
    <>
      <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>Log in</Link>
      <Link href="/signup" className="btn btn-primary" style={{ padding: "9px 15px", fontSize: 13.5 }}>Start free</Link>
    </>
  );
}

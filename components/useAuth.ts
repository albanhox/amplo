"use client";

import { useEffect, useState } from "react";

export interface AuthAccount {
  id: string;
  email: string;
  name?: string;
  plan: string;
  subscriptionStatus: string;
}

/**
 * Client auth state. `required` redirects to a login/signup page when there's
 * no session. Returns the account (or null) and a loading flag.
 */
export function useAuth(opts?: { required?: boolean; redirectTo?: string; next?: string }) {
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setAccount(d.account);
        setLoading(false);
        if (opts?.required && !d.account) {
          const to = opts.redirectTo || "/login";
          const next = opts.next ? `?next=${encodeURIComponent(opts.next)}` : "";
          window.location.href = `${to}${next}`;
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return { account, loading, logout };
}

import Link from "next/link";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { NavAuth } from "./NavAuth";

export function SiteNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(1.4) blur(14px)",
        background: "color-mix(in srgb, var(--bg) 82%, transparent)",
        borderBottom: "1px solid var(--line-2)",
      }}
    >
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/"><Wordmark /></Link>
        <nav className="md-nav" style={{ alignItems: "center", gap: 26, fontSize: 14.5, fontWeight: 650, color: "var(--muted)" }}>
          <a href="/#how">How it works</a>
          <a href="/#reviews">Reviews → Posts</a>
          <a href="/#pricing">Pricing</a>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <NavAuth />
        </div>
      </div>
    </header>
  );
}

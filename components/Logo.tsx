export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: "linear-gradient(145deg, var(--brand), var(--brand-deep))",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 4px 12px -3px rgba(238,90,54,.6)",
        flex: "none",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.56, height: size * 0.56 }}>
        <path d="M4 14c3-9 13-9 16 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2.6" fill="#fff" />
        <path d="M12 15v5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 850, fontSize: 19, letterSpacing: "-.03em" }}>
      <Logo size={size} />
      Popd
    </span>
  );
}

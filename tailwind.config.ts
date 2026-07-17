import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        line: "var(--line)",
        brand: "var(--brand)",
        "brand-deep": "var(--brand-deep)",
        spruce: "var(--spruce)",
        "spruce-2": "var(--spruce-2)",
        gold: "var(--gold)",
        good: "var(--good)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "18px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20,25,18,.05), 0 10px 30px -12px rgba(20,25,18,.16)",
        lg2: "0 2px 4px rgba(20,25,18,.06), 0 30px 60px -20px rgba(20,25,18,.28)",
      },
    },
  },
  plugins: [],
};

export default config;

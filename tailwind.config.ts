import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fg: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
        },
        border: "var(--border)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        neon: {
          cyan: "var(--neon-cyan)",
          blue: "var(--neon-blue)",
          fuchsia: "var(--neon-fuchsia)",
        },
      },
      boxShadow: {
        neon:
          "0 12px 35px -15px rgba(34,211,238,0.75), 0 12px 40px -18px rgba(59,130,246,0.65), 0 14px 50px -22px rgba(217,70,239,0.55)",
      },
      backgroundImage: {
        "mesh-neon":
          "radial-gradient(1100px 700px at 10% 10%, rgba(34,211,238,0.20), transparent 60%), radial-gradient(900px 600px at 85% 20%, rgba(217,70,239,0.18), transparent 58%), radial-gradient(1000px 700px at 60% 90%, rgba(59,130,246,0.18), transparent 60%)",
        "mesh-neon-light":
          "radial-gradient(1100px 700px at 10% 10%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(900px 600px at 85% 20%, rgba(217,70,239,0.06), transparent 58%), radial-gradient(1000px 700px at 60% 90%, rgba(59,130,246,0.06), transparent 60%), linear-gradient(to bottom, #f8fafc, #e2e8f0)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-30%)", opacity: "0.0" },
          "20%": { opacity: "0.35" },
          "100%": { transform: "translateX(120%)", opacity: "0.0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        shimmer: "shimmer 2.6s ease-in-out infinite",
        glow: "glow 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

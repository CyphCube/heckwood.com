import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Heckwood palette — charcoal dark UI with the logo's forest green
        ink: "#0a0d0b",
        surface: "#12160f",
        elevated: "#1a201a",
        line: "#2a322a",
        accent: "#22a14f",
        "accent-soft": "#57cf80",
        brand: "#1f7a3a",
        cream: "#f4f1e6",
        muted: "#97a399",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        player: "0 -8px 30px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Heckwood palette — deep plum + warm accent, app-like dark UI
        ink: "#0e0b14",
        surface: "#16121f",
        elevated: "#1f1a2c",
        line: "#2a2438",
        accent: "#a855f7",
        "accent-soft": "#c084fc",
        muted: "#9a93a8",
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

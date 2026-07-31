import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        card: "var(--card)",
        border: "var(--border)",

        // Csapatszínek (Neon Noir paletta)
        teams: {
          red: "var(--team-red)",
          blue: "var(--team-blue)",
          green: "var(--team-green)",
          yellow: "var(--team-yellow)",
          purple: "var(--team-purple)",
          orange: "var(--team-orange)",
          pink: "var(--team-pink)",
          cyan: "var(--team-cyan)",
          lime: "var(--team-lime)",
          white: "var(--team-white)",
        },
      },
      boxShadow: {
        neon: "0 0 10px rgba(255, 0, 255, 0.5)",
        "neon-strong": "0 0 20px rgba(255, 0, 255, 0.8)",
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: "#0E0E0E",
        panel: "#171717",
        "panel-soft": "#1C1C1C",
        line: "#2A2A2A",
        steel: "#B5B5B5",
        ignition: "#E8331C",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "Arial", "sans-serif"],
        body: ["var(--font-body)", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(232, 51, 28, 0.36), 0 18px 55px rgba(0, 0, 0, 0.32)",
        card: "0 22px 60px rgba(0, 0, 0, 0.26)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Warm neutral palette
        cream: {
          50: "#FEFDFB",
          100: "#FBF9F5",
          200: "#F5F2EB",
          300: "#EDE8DD",
          400: "#E0D9C9",
          500: "#C9BFA8",
        },
        ink: {
          50: "#F7F7F6",
          100: "#E3E3E1",
          200: "#C7C7C3",
          300: "#A8A8A2",
          400: "#8A8A82",
          500: "#6B6B63",
          600: "#56564F",
          700: "#414140",
          800: "#2D2D2C",
          900: "#1A1A19",
          950: "#0D0D0C",
        },
        accent: {
          teal: "#2A9D8F",
          coral: "#E76F51",
          gold: "#E9C46A",
          slate: "#264653",
          sage: "#6B8E7E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        lifted: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

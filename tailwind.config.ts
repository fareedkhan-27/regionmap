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
        // Premium futuristic palette
        space: {
          50: "#F0F4FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#1E1B4B",
          950: "#0F0D1E",
        },
        void: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#1F2937",
          700: "#111827",
          800: "#0D1117",
          900: "#0A0D14",
          950: "#05070A",
        },
        neon: {
          cyan: "#00F5FF",
          blue: "#0D7EFF",
          purple: "#A855F7",
          pink: "#EC4899",
          gold: "#FFD700",
          emerald: "#10B981",
        },
        // Legacy support (will be gradually replaced)
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
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #00F5FF 0%, #0D7EFF 50%, #A855F7 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0D14 0%, #1E1B4B 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        lifted: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
        neon: "0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)",
        'neon-purple': "0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)",
        'neon-gold': "0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
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
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 245, 255, 0.5), 0 0 10px rgba(0, 245, 255, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 245, 255, 0.8), 0 0 30px rgba(0, 245, 255, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

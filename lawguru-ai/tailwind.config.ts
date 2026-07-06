import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        earth: {
          50: "#FDF8F0",
          100: "#F5EDDC",
          200: "#E8D5B5",
          300: "#D4B88C",
          400: "#C09A64",
          500: "#A67B3D",
          600: "#8B6330",
          700: "#6B4C24",
          800: "#4A3419",
          900: "#2A1E0F",
          950: "#1C1006",
        },
        copper: {
          DEFAULT: "#B87333",
          light: "#D4944A",
          dark: "#8B5A2B",
          glow: "rgba(184,115,51,0.2)",
        },
        terracotta: {
          DEFAULT: "#C67B5C",
          light: "#D99A80",
          dark: "#A65D3F",
        },
        gold: {
          DEFAULT: "#CA8A04",
          light: "#EAB308",
          dark: "#92400E",
          glow: "rgba(202,138,4,0.2)",
        },
        zambia: {
          green: "#198A00",
          red: "#DE2010",
          black: "#000000",
          orange: "#FF6B00",
        },
        surface: {
          primary: "#1C1006",
          secondary: "#2A1810",
          tertiary: "#3D2317",
          card: "#2E1C12",
          elevated: "#4A2E1E",
        },
        accent: {
          DEFAULT: "#CA8A04",
          muted: "#92400E",
          glow: "rgba(202,138,4,0.2)",
        },
        irac: {
          issue: "#EAB308",
          rule: "#3B82F6",
          application: "#C67B5C",
          conclusion: "#198A00",
        },
      },
      fontFamily: {
        heading: ["Outfit", "system-ui", "sans-serif"],
        body: ["Work Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(202,138,4,0.15)",
        "glow-lg": "0 0 40px rgba(202,138,4,0.25)",
        "copper-glow": "0 0 20px rgba(184,115,51,0.2)",
        warm: "0 4px 30px rgba(28,16,6,0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-warm":
          "linear-gradient(135deg, #1C1006 0%, #2A1810 50%, #3D2317 100%)",
        "kente-pattern": `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 20px,
          rgba(202,138,4,0.03) 20px,
          rgba(202,138,4,0.03) 21px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 20px,
          rgba(184,115,51,0.03) 20px,
          rgba(184,115,51,0.03) 21px
        )`,
        "adinkra-dots": `radial-gradient(circle, rgba(202,138,4,0.06) 1px, transparent 1px)`,
      },
      backgroundSize: {
        kente: "40px 40px",
        adinkra: "24px 24px",
      },
      borderColor: {
        earth: "#4A3419",
        copper: "#B87333",
        gold: "#CA8A04",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        glow: "glow 2s ease-in-out infinite alternate",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(202,138,4,0.1)" },
          "100%": { boxShadow: "0 0 40px rgba(202,138,4,0.3)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

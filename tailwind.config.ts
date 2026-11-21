import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#4169E1", // Royal Blue
          foreground: "#FFFFFF",
          hover: "#3457C7",
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#4169E1",
          600: "#3457C7",
          700: "#2742A8",
        },
        secondary: {
          DEFAULT: "#7952D9", // Deep Iris Purple
          foreground: "#FFFFFF",
          hover: "#663EC0",
          50: "#F5F3FF",
          100: "#EDE9FE",
          500: "#7952D9",
          600: "#663EC0",
        },
        accent: {
          DEFAULT: "#38BDF8", // Sky Blue
          foreground: "#0F172A",
          50: "#F0F9FF",
          100: "#E0F2FE",
          500: "#38BDF8",
          600: "#0284C7",
        },
        text: {
          primary: "#172033",   // Deep Midnight Slate
          secondary: "#64748B", // Slate 500
          muted: "#94A3B8",     // Slate 400
        },
        border: "#E8ECF4",
        input: "#E8ECF4",
        ring: "#4169E1",
        softLavender: "#F0EBFF",
        softMint: "#D1FAE5",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#172033",
        },
        // Stream Badge Colors
        stream: {
          medical: {
            bg: "#ECFDF5",
            text: "#047857",
            border: "#A7F3D0",
          },
          pcm: {
            bg: "#EFF6FF",
            text: "#1D4ED8",
            border: "#BFDBFE",
          },
          commerce: {
            bg: "#EEF2FF",
            text: "#4338CA",
            border: "#C7D2FE",
          },
          humanities: {
            bg: "#FFFBEB",
            text: "#B45309",
            border: "#FDE68A",
          },
          law: {
            bg: "#FAF5FF",
            text: "#7E22CE",
            border: "#E9D5FF",
          },
          management: {
            bg: "#F0FDF4",
            text: "#15803D",
            border: "#BBF7D0",
          },
          creative: {
            bg: "#FDF2F8",
            text: "#BE185D",
            border: "#FBCFE8",
          },
          agriculture: {
            bg: "#F7FEE7",
            text: "#4D7C0F",
            border: "#D9F99D",
          },
          vocational: {
            bg: "#FFF7ED",
            text: "#C2410C",
            border: "#FFEDD5",
          },
          sports: {
            bg: "#ECFEFF",
            text: "#0E7490",
            border: "#A5F3FC",
          },
          hospitality: {
            bg: "#FEF2F2",
            text: "#B91C1C",
            border: "#FECACA",
          },
          undecided: {
            bg: "#F8FAFC",
            text: "#475569",
            border: "#E2E8F0",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "soft-xs": "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        "soft-sm": "0 2px 4px -1px rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)",
        "soft-md": "0 4px 8px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        "soft-lg": "0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
        "soft-xl": "0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-gentle": "float-gentle 4s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

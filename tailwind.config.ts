import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        soft: "0 8px 24px -12px rgba(15, 23, 42, 0.2)",
        "ride-xs": "0 1px 2px rgba(15, 23, 42, 0.04)",
        "ride-sm": "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        "ride-md": "0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
        "ride-lg": "0 12px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.04)",
        "ride-xl": "0 24px 60px -16px rgba(15, 23, 42, 0.18), 0 8px 20px rgba(15, 23, 42, 0.06)",
        "ride-float": "0 32px 80px -24px rgba(29, 78, 216, 0.22), 0 12px 32px -16px rgba(15, 23, 42, 0.12)",
        "ride-glow": "0 0 0 1px rgba(29, 78, 216, 0.10), 0 8px 32px -8px rgba(29, 78, 216, 0.35)",
        "ride-glow-sm": "0 0 0 1px rgba(29, 78, 216, 0.08), 0 4px 16px -4px rgba(29, 78, 216, 0.25)",
        "ride-inner": "inset 0 1px 0 rgba(255, 255, 255, 0.06)"
      },
      backgroundImage: {
        "ride-radial": "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(29,78,216,0.12), transparent 70%)",
        "ride-mesh":
          "radial-gradient(at 20% 0%, rgba(29,78,216,0.10) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.10) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(56,189,248,0.06) 0px, transparent 50%)",
        "ride-grid":
          "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
        "ride-grid-light":
          "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
        "ride-dots":
          "radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)",
        "ride-gradient-primary": "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
        "ride-gradient-primary-hover": "linear-gradient(135deg, #1e40af 0%, #3730a3 100%)",
        "ride-gradient-text": "linear-gradient(135deg, #1d4ed8 0%, #6366f1 50%, #1d4ed8 100%)",
        "ride-gradient-surface": "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.6) 100%)",
        "ride-gradient-card": "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.4) 100%)",
        "ride-gradient-dark": "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 50%, #4338ca 100%)"
      },
      backgroundSize: {
        "ride-grid": "32px 32px",
        "ride-grid-sm": "24px 24px",
        "ride-dots": "20px 20px"
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" }
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-out infinite"
      },
      transitionTimingFunction: {
        "ride-spring": "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

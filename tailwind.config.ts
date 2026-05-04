import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./types/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        monkey: {
          green: "#22C55E",
          greenDark: "#16A34A",
          yellow: "#FACC15",
          orange: "#FB923C",
          purple: "#8B5CF6",
          blue: "#38BDF8",
          pink: "#FB7185",
          mint: "#A7F3D0",
          bg: "#F9FAFB",
          card: "#FFFFFF",
          ink: "#111827",
          muted: "#6B7280",
          line: "#E5E7EB"
        }
      },
      borderRadius: {
        card: "22px",
        item: "16px",
        pill: "999px",
        monkey: "22px"
      },
      boxShadow: {
        soft: "0 18px 40px rgba(17, 24, 39, 0.10)",
        card: "0 10px 30px rgba(17, 24, 39, 0.08)",
        float: "0 16px 38px rgba(34, 197, 94, 0.35)"
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(.92)", opacity: "0" },
          "70%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        checkPulse: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" }
        },
        slideUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        completeOut: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1", maxHeight: "220px" },
          "22%": { transform: "translateY(-6px) scale(1.018)", opacity: "1", maxHeight: "220px" },
          "100%": { transform: "translateY(-18px) scale(.985)", opacity: "0", maxHeight: "0px", marginTop: "0", marginBottom: "0", paddingTop: "0", paddingBottom: "0" }
        },
        heroShimmer: {
          "0%, 100%": { transform: "translateX(-18%)", opacity: ".55" },
          "50%": { transform: "translateX(12%)", opacity: ".95" }
        },
        heroBlob: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-14px,12px,0) scale(1.08)" }
        },
        heroBlobSlow: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(12px,-10px,0) scale(1.06)" }
        }
      },
      animation: {
        pop: "pop .32s cubic-bezier(.2,.8,.2,1)",
        floaty: "floaty 3.2s ease-in-out infinite",
        checkPulse: "checkPulse .28s ease-out",
        slideUp: "slideUp .25s ease-out",
        completeOut: "completeOut .62s cubic-bezier(.2,.8,.2,1) forwards",
        heroShimmer: "heroShimmer 9s ease-in-out infinite",
        heroBlob: "heroBlob 8s ease-in-out infinite",
        heroBlobSlow: "heroBlobSlow 11s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

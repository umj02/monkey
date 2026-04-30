import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
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
          bg: "#F9FAFB",
          ink: "#111827"
        }
      },
      borderRadius: {
        "monkey": "22px"
      },
      boxShadow: {
        "soft": "0 18px 40px rgba(17, 24, 39, 0.10)"
      }
    }
  },
  plugins: []
};
export default config;

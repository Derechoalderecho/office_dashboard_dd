import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#08ACD7",
          foreground: "hsl(var(--primary-foreground))",
          100: "#E0F7FE",
          200: "#A0E1FC",
          600: "#1895C9",
          900: "#0F6B97",
        },
        secondary: {
          DEFAULT: "#7b828b",
          foreground: "hsl(var(--secondary-foreground))",
          500: "#8848FE",
          600: "#6C3AC6",
        },
        black: {
          DEFAULT: "rgba(0, 0, 0, 1)",
          80: "rgba(0, 0, 0, 0.8)",
          40: "rgba(0, 0, 0, 0.4)",
          20: "rgba(0, 0, 0, 0.2)",
          10: "rgba(0, 0, 0, 0.1)",
          5: "rgba(0, 0, 0, 0.05)",
        },
		white: {
			DEFAULT: "rgba(255, 255, 255, 1)",
			80: "rgba(255, 255, 255, 0.8)",
			40: "rgba(255, 255, 255, 0.4)",
			20: "rgba(255, 255, 255, 0.2)",
			10: "rgba(255, 255, 255, 0.1)",
			5: "rgba(255, 255, 255, 0.05)",
		},
        student: "#a7e6c2",
        tertiary: "#D4EAFF",
        bgNav: "rgba(8, 172, 215, 0.15)",
        followed: "rgba(0, 111, 238, 0.20)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  darkMode: ["class", "class"],
  plugins: [heroui(), require("tailwindcss-animate")],
} satisfies Config;

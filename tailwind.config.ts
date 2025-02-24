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
        primary: "#08ACD7",
        secondary: "#7b828b",
        tertiary: "#D4EAFF",
        bgNav: "rgba(8, 172, 215, 0.15)",
        success: "rgba(23, 201, 100, 0.20)",
        warning: "rgba(245, 165, 36, 0.20)",
        error: "rgba(243, 18, 96, 0.20)",
        followed: "rgba(0, 111, 238, 0.20)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
} satisfies Config;

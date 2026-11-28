import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0101B7",
          secondary: "#8DCCF1",
          accent: "#FFD166",
          canvas: "#F2F7FF",
          ink: "#0F172A",
          muted: "#475569",
        },
      },
      fontFamily: {
        heading: ["var(--font-lexend)", "sans-serif"],
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: "#F2F7FF",
            foreground: "#0F172A",
            primary: {
              DEFAULT: "#0101B7",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#8DCCF1",
              foreground: "#0F172A",
            },
            warning: {
              DEFAULT: "#FFD166",
              foreground: "#0F172A",
            },
          },
        },
      },
    }),
  ],
};

export default config;

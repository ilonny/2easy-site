import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        wide: "1440px",
      },
      keyframes: {
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        "sticker-rise": {
          from: { transform: "translateY(100vh)" },
          to: { transform: "translateY(-100%)" },
        },
        "sticker-sway": {
          from: { transform: "translateX(-25%) rotate(var(--sway))" },
          to: { transform: "translateX(25%) rotate(calc(var(--sway) * -1))" },
        },
        "marker-stretch": {
          "0%, 100%": { transform: "scale(1)" },
          "35%": { transform: "scaleY(2.1) scaleX(0.75)" },
          "70%": { transform: "scaleY(0.8) scaleX(1.15)" },
        },
        "content-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "sticker-rise":
          "sticker-rise var(--rise-duration) cubic-bezier(0.55, 0.085, 0.68, 0.53) var(--rise-delay) both",
        "sticker-sway":
          "sticker-sway 0.8s ease-in-out var(--rise-delay) infinite alternate",
        "marker-stretch": "marker-stretch 0.52s cubic-bezier(0.22, 1, 0.36, 1)",
        "content-in": "content-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#3F28C6",
        pinkSecondary: "#FF7EB3",
        black: "#2D2D2D",
        brand: {
          violet: "#5A42D4",
          orange: "#F7531F",
          green: "#C6FF75",
          gray: "#F1F1F4",
          grayFont: "#6E6E74",
          black: "#181818",
        },
      },
      letterSpacing: {
        brand: "-0.01em",
      },
      borderColor: {
        primary: "#3F28C6",
        pinkSecondary: "#FF7EB3",
      },
    },
  },
  plugins: [nextui()],
  mode: "jit",
};
export default config;

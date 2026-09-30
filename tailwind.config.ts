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

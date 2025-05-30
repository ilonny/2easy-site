import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#3F28C6",
        pinkSecondary: "#FF7EB3",
        black: "#2D2D2D"
      },
      borderColor: {
        primary: "#3F28C6",
        pinkSecondary: "#FF7EB3",
      },
    },
  },
  plugins: [nextui()],
};
export default config;

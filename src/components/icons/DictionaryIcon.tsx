"use client";

import { FC } from "react";

type TProps = {
  size?: number;
  className?: string;
  color?: string;
};

export const DictionaryIcon: FC<TProps> = ({
  size = 24,
  className = "",
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={color ? { color } : undefined}
    aria-hidden
  >
    <rect
      x="10"
      y="10"
      width="45"
      height="45"
      rx="5"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      d="M22 25H42M32 25V42M25 32C25 32 28 42 38 42"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <rect
      x="45"
      y="45"
      width="45"
      height="45"
      rx="5"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      d="M58 78L67.5 57L77 78M61 72H74"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25 55V65C25 68 28 71 31 71H40M40 71L36 67M40 71L36 75"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M75 45V35C75 32 72 29 69 29H60M60 29L64 25M60 29L64 33"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

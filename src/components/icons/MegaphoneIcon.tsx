"use client";

import { FC } from "react";

type TProps = {
  size?: number;
  className?: string;
  color?: string;
};

export const MegaphoneIcon: FC<TProps> = ({
  size = 20,
  className = "",
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={color ? { color } : undefined}
    aria-hidden
  >
    <path
      d="M3 10v4h4l5 4V6L7 10H3z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 9.5a4.5 4.5 0 0 1 0 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16.5 7.5a7.5 7.5 0 0 1 0 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

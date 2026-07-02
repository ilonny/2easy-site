"use client";

import { FC } from "react";

type TProps = {
  className?: string;
};

/** Single sticky note with pushpin — centered in viewBox */
export const StickyNoteIcon: FC<TProps> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <g transform="translate(0 -1.25) rotate(-12 12 12)">
      <rect
        x="6"
        y="8"
        width="12"
        height="12"
        rx="1.5"
        fill="#FFEB3B"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="6.25"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.2 7.55L10.35 8.65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

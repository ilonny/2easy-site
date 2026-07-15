"use client";

import { FC } from "react";

type TProps = {
  className?: string;
};

/** Note with a folded bottom-right corner (dog-ear) — outline only */
export const StickyNoteIcon: FC<TProps> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M6 4H18A2 2 0 0 1 20 6V14L14 20H6A2 2 0 0 1 4 18V6A2 2 0 0 1 6 4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M20 14H14V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

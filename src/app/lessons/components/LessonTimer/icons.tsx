"use client";

import { FC } from "react";

type TIconProps = {
  className?: string;
  size?: number;
};

export const TimerClockIcon: FC<TIconProps> = ({ className, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <circle
      cx="12"
      cy="13"
      r="8"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M12 9.5V13l2.4 1.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 3.5h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const TimerPlayIcon: FC<TIconProps> = ({ className, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path d="M8.2 5.8a1 1 0 0 1 1.53-.85l9.1 5.7a1 1 0 0 1 0 1.7l-9.1 5.7A1 1 0 0 1 8 16.7V6.3a1 1 0 0 1 .2-.5Z" />
  </svg>
);

export const TimerPauseIcon: FC<TIconProps> = ({ className, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <rect x="6.5" y="5" width="3.5" height="14" rx="1.2" />
    <rect x="14" y="5" width="3.5" height="14" rx="1.2" />
  </svg>
);

export const TimerResetIcon: FC<TIconProps> = ({ className, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M4.5 5.5V9.2H8.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

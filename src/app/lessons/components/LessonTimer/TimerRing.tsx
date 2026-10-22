"use client";

import { FC } from "react";

type TProps = {
  progress: number;
  label: string;
  size?: number;
  pulse?: boolean;
  compact?: boolean;
};

export const TimerRing: FC<TProps> = ({
  progress,
  label,
  size = 72,
  pulse,
  compact,
}) => {
  const stroke = compact ? 3.5 : 4.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        pulse ? "animate-pulse" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EEEBFF"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#7561DB"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>
      <span
        className={`absolute font-semibold tabular-nums tracking-tight text-[#231F20] ${
          compact ? "text-[11px]" : "text-sm"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

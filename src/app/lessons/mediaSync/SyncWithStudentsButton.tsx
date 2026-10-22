"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";

function SyncWithStudentsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M3.4 7.15v9.7c0 .62.68.99 1.2.66l7.35-4.85a.78.78 0 0 0 0-1.32L4.6 6.49c-.52-.33-1.2.04-1.2.66Z"
      />
      <path
        d="M16.15 9.05a3.15 3.15 0 0 1 0 5.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M18.55 6.35a6.15 6.15 0 0 1 0 11.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SyncWithStudentsButton({
  onClick,
  placement = "top",
  active = false,
}: {
  onClick: () => void;
  placement?: "top" | "left" | "bottom" | "right";
  active?: boolean;
}) {
  const { t } = useTranslation();
  const [hot, setHot] = useState(false);
  const label = t(active ? "lessons.syncMedia.tooltipOn" : "lessons.syncMedia.tooltip");

  return (
    <ResponsiveTooltip content={label} placement={placement} delay={150} closeDelay={0}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={() => {
          setHot(true);
          window.setTimeout(() => setHot(false), 900);
          onClick();
        }}
        className={`group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ring-2 ring-white/90 transition duration-200 hover:scale-105 active:scale-95 ${
          active
            ? "bg-[#FF4FA3] shadow-[0_8px_18px_rgba(255,79,163,0.45)] hover:bg-[#ff6ab3]"
            : "bg-[#3F28C6] shadow-[0_8px_18px_rgba(63,40,198,0.38)] hover:bg-[#5336e0]"
        }`}
      >
        {hot && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#FF7EB3]/50" />
        )}
        <span className="relative z-[1] flex">
          <SyncWithStudentsIcon />
        </span>
      </button>
    </ResponsiveTooltip>
  );
}

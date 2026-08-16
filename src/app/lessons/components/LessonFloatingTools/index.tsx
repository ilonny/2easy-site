"use client";

import { Button } from "@nextui-org/react";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import i18n from "@/i18n/config";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { LESSON_FAB_STACK_CLASS } from "@/app/lessons/constants";

type TProps = {
  children: ReactNode;
};

/** Menu trigger: arrow up + dots, single SVG so nothing is clipped. */
const ToolsMenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M12 10V3.5" strokeLinecap="round" />
    <path
      d="M6.5 8L12 2.5 17.5 8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13.5" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="12" cy="17.25" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="12" cy="21" r="1.35" fill="currentColor" stroke="none" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
  </svg>
);

export const LessonFloatingTools: FC<TProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuLabel = open
    ? i18n.t("common.close")
    : i18n.t("lessons.lessonTools");

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={LESSON_FAB_STACK_CLASS}>
      <div
        className={`flex-col items-end gap-2 ${
          open
            ? "flex rounded-2xl bg-white p-2 shadow-[0_8px_32px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
            : "hidden"
        } md:flex md:bg-transparent md:p-0 md:shadow-none md:ring-0`}
        onClickCapture={() => {
          window.requestAnimationFrame(() => setOpen(false));
        }}
      >
        {children}
      </div>
      <ResponsiveTooltip content={menuLabel} placement="left">
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="min-w-12 w-12 h-12 touch-manipulation text-white shadow-lg md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={menuLabel}
        >
          {open ? <CloseIcon /> : <ToolsMenuIcon />}
        </Button>
      </ResponsiveTooltip>
    </div>
  );
};

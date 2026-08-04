"use client";

import { Button } from "@nextui-org/react";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { T } from "@/i18n/T";
import { LESSON_FAB_STACK_CLASS } from "@/app/lessons/constants";

type TProps = {
  children: ReactNode;
};

export const LessonFloatingTools: FC<TProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        className={`w-full flex-col items-stretch gap-2 sm:items-end ${
          open
            ? "flex rounded-2xl bg-white p-3 shadow-[0_8px_32px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
            : "hidden"
        } md:flex md:bg-transparent md:p-0 md:shadow-none md:ring-0`}
        onClickCapture={() => {
          window.requestAnimationFrame(() => setOpen(false));
        }}
      >
        {children}
      </div>
      <Button
        color="primary"
        size="lg"
        className="min-h-12 w-full touch-manipulation shadow-lg md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? (
          <T k="common.close" defaultText="Закрыть" />
        ) : (
          <T k="lessons.lessonTools" defaultText="Меню урока" />
        )}
      </Button>
    </div>
  );
};

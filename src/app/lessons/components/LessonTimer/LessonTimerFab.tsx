"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import { LESSON_FAB_BUTTON_CLASS } from "@/app/lessons/constants";
import i18n from "@/i18n/config";
import type { TUseLessonTimer } from "@/app/lessons/mediaSync/useLessonTimer";
import { LessonTimerControls } from "./LessonTimerControls";
import { TimerClockIcon } from "./icons";
import { TimerRing } from "./TimerRing";

type TProps = {
  timer: TUseLessonTimer;
  /** Hide on md+ when desktop panel is shown for teachers. */
  mobileOnly?: boolean;
  /** Hide when idle for students who have nothing to open. */
  hideWhenIdle?: boolean;
};

const MD_QUERY = "(min-width: 768px)";

export const LessonTimerFab: FC<TProps> = ({
  timer,
  mobileOnly,
  hideWhenIdle,
}) => {
  const [open, setOpen] = useState(false);
  const label = i18n.t("lessons.timer.title");

  // Teacher: FAB is mobile-only; if popover was open on mobile and viewport
  // becomes desktop, close it so it does not float over the sidebar panel.
  useEffect(() => {
    if (!mobileOnly) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(MD_QUERY);
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobileOnly]);

  if (hideWhenIdle && timer.isIdle && !timer.isTeacher) {
    return null;
  }

  const showRing =
    timer.state.status === "running" ||
    timer.state.status === "paused" ||
    timer.state.status === "finished";

  return (
    <Popover
      placement="left-end"
      isOpen={open}
      onOpenChange={setOpen}
      classNames={{
        content: "p-3",
      }}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          color="primary"
          variant="light"
          size="lg"
          aria-label={label}
          className={`${LESSON_FAB_BUTTON_CLASS} ${
            mobileOnly ? "md:hidden" : ""
          } ${timer.finishedPulse ? "animate-pulse" : ""}`}
        >
          {showRing ? (
            <TimerRing
              progress={
                timer.state.status === "finished" ? 0 : timer.progress
              }
              label={timer.display}
              size={44}
              compact
              pulse={timer.finishedPulse}
            />
          ) : (
            <TimerClockIcon className="text-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className={`w-[180px] ${mobileOnly ? "md:hidden" : ""}`}>
          <LessonTimerControls timer={timer} compact />
        </div>
      </PopoverContent>
    </Popover>
  );
};

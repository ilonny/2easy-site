"use client";

import { Button } from "@nextui-org/react";
import { FC, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import type { TUseLessonTimer } from "@/app/lessons/mediaSync/useLessonTimer";
import { LessonTimerControls } from "./LessonTimerControls";
import { TimerClockIcon } from "./icons";
import { TimerRing } from "./TimerRing";

type TProps = {
  timer: TUseLessonTimer;
  compact?: boolean;
};

export const LessonTimerPanel: FC<TProps> = ({ timer, compact }) => {
  const [expanded, setExpanded] = useState(false);
  const label = i18n.t("lessons.timer.title");
  const showRing =
    timer.state.status === "running" ||
    timer.state.status === "paused" ||
    timer.state.status === "finished";

  if (!expanded) {
    return (
      <div className={`mt-3 flex justify-center ${compact ? "mt-0" : ""}`}>
        <ResponsiveTooltip content={label} placement="left">
          <Button
            isIconOnly
            color="primary"
            variant="light"
            size="lg"
            aria-label={label}
            aria-expanded={false}
            className={`min-w-12 w-12 h-12 text-primary ${
              timer.finishedPulse ? "animate-pulse" : ""
            }`}
            onClick={() => setExpanded(true)}
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
        </ResponsiveTooltip>
      </div>
    );
  }

  return (
    <div
      className={`mt-3 w-full rounded-2xl bg-white p-3 shadow-[0_4px_18px_rgba(35,31,32,0.06)] ring-1 ring-black/5 ${
        compact ? "mt-0" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-1.5">
        <div className="flex flex-1 items-center justify-center gap-1.5">
          <TimerClockIcon size={14} className="text-[#7561DB]" />
          <p className="text-center text-[10px] font-bold uppercase tracking-wide text-[#231F20] sm:text-xs">
            <T k="lessons.timer.title" defaultText="Timer" />
          </p>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="min-w-7 w-7 h-7 text-default-400"
          aria-label={i18n.t("common.close")}
          onClick={() => setExpanded(false)}
        >
          <span className="text-base leading-none">×</span>
        </Button>
      </div>
      <LessonTimerControls timer={timer} compact={compact} />
    </div>
  );
};

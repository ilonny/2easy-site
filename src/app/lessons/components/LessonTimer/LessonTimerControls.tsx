"use client";

import { Button, Input } from "@nextui-org/react";
import { FC, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { LESSON_TIMER_PRESETS_SEC } from "@/app/lessons/mediaSync/types";
import type { TUseLessonTimer } from "@/app/lessons/mediaSync/useLessonTimer";
import { TimerPauseIcon, TimerPlayIcon, TimerResetIcon } from "./icons";
import { TimerRing } from "./TimerRing";

type TProps = {
  timer: TUseLessonTimer;
  compact?: boolean;
};

const presetLabel = (sec: number) => {
  if (sec % 60 === 0) return `${sec / 60}m`;
  return `${sec}s`;
};

export const LessonTimerControls: FC<TProps> = ({ timer, compact }) => {
  const [customMinutes, setCustomMinutes] = useState("5");
  const [customSeconds, setCustomSeconds] = useState("0");
  const {
    isTeacher,
    state,
    display,
    progress,
    finishedPulse,
    start,
    pause,
    resume,
    reset,
  } = timer;

  const onCustomStart = () => {
    const minutes = Math.floor(Number(String(customMinutes).replace(",", ".")) || 0);
    const seconds = Math.floor(Number(String(customSeconds).replace(",", ".")) || 0);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return;
    if (minutes < 0 || seconds < 0 || seconds > 59) return;
    const sec = minutes * 60 + seconds;
    if (sec < 1 || sec > 60 * 60 * 3) return;
    start(sec);
  };

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-2" : "gap-3"}`}>
      <TimerRing
        progress={
          state.status === "idle" ? 0 : state.status === "finished" ? 0 : progress
        }
        label={state.status === "idle" ? "00:00" : display}
        size={compact ? 64 : 80}
        compact={compact}
        pulse={finishedPulse || state.status === "finished"}
      />

      {isTeacher && (
        <>
          {(state.status === "idle" || state.status === "finished") && (
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-wrap justify-center gap-1.5">
                {LESSON_TIMER_PRESETS_SEC.map((sec) => (
                  <Button
                    key={sec}
                    size="sm"
                    radius="full"
                    variant="flat"
                    className="min-w-0 bg-[#EEEBFF] px-2.5 text-xs font-semibold text-[#7561DB]"
                    onClick={() => start(sec)}
                  >
                    {presetLabel(sec)}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  value={customMinutes}
                  onValueChange={setCustomMinutes}
                  aria-label={i18n.t("lessons.timer.customMinutes")}
                  classNames={{
                    inputWrapper: "h-8 min-h-8 bg-white shadow-none",
                    input: "text-xs tabular-nums",
                    base: "min-w-0 flex-1",
                  }}
                  endContent={
                    <span className="text-[10px] text-default-400">
                      <T k="lessons.timer.min" defaultText="min" />
                    </span>
                  }
                />
                <span className="text-xs font-semibold text-default-400">:</span>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={customSeconds}
                  onValueChange={setCustomSeconds}
                  aria-label={i18n.t("lessons.timer.customSeconds")}
                  classNames={{
                    inputWrapper: "h-8 min-h-8 bg-white shadow-none",
                    input: "text-xs tabular-nums",
                    base: "min-w-0 flex-1",
                  }}
                  endContent={
                    <span className="text-[10px] text-default-400">
                      <T k="lessons.timer.sec" defaultText="sec" />
                    </span>
                  }
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  radius="full"
                  className="shrink-0"
                  aria-label={i18n.t("lessons.timer.start")}
                  onClick={onCustomStart}
                >
                  <TimerPlayIcon />
                </Button>
              </div>
            </div>
          )}

          {(state.status === "running" || state.status === "paused") && (
            <div className="flex items-center gap-2">
              {state.status === "running" ? (
                <Button
                  isIconOnly
                  size="sm"
                  radius="full"
                  className="bg-[#EEEBFF] text-[#7561DB]"
                  aria-label={i18n.t("lessons.timer.pause")}
                  onClick={pause}
                >
                  <TimerPauseIcon />
                </Button>
              ) : (
                <Button
                  isIconOnly
                  size="sm"
                  radius="full"
                  color="primary"
                  aria-label={i18n.t("lessons.timer.resume")}
                  onClick={resume}
                >
                  <TimerPlayIcon />
                </Button>
              )}
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="flat"
                aria-label={i18n.t("lessons.timer.reset")}
                onClick={reset}
              >
                <TimerResetIcon />
              </Button>
            </div>
          )}
        </>
      )}

      {!isTeacher && state.status === "paused" && (
        <p className="text-[10px] font-medium uppercase tracking-wide text-[#7561DB]">
          <T k="lessons.timer.paused" defaultText="Paused" />
        </p>
      )}
    </div>
  );
};

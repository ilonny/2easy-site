"use client";

import { FC } from "react";
import { LessonTimerFab } from "@/app/lessons/components/LessonTimer";
import type { TUseLessonTimer } from "@/app/lessons/mediaSync/useLessonTimer";
import { Chat } from "@/components/Chat";
import { VideoCallTrigger } from "@/components/VideoCall";

const TOOL_BUTTON_CLASS = "bg-white/95 shadow-lg ring-1 ring-black/5";

type TProps = {
  timer: TUseLessonTimer;
  /** Lesson thread. When set, the button opens that lesson's chat. */
  lessonId?: number;
  studentId?: number;
  lessonSessionId?: number;
  isTeacher?: boolean;
  /** Used when the board is not opened from a lesson. */
  boardId?: number;
};

/** Chat, video call, and timer pinned to the corner of a board. */
export const BoardSessionTools: FC<TProps> = ({
  timer,
  lessonId = 0,
  studentId,
  lessonSessionId,
  isTeacher = false,
  boardId = 0,
}) => {
  return (
    <div className="pointer-events-auto absolute bottom-3 right-3 z-[100] flex items-end gap-2 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-4 sm:right-4">
      <Chat
        lesson_id={lessonId}
        studentId={studentId}
        lessonSessionId={lessonSessionId}
        isTeacher={isTeacher || timer.isTeacher}
        boardId={lessonId ? 0 : boardId}
        className={TOOL_BUTTON_CLASS}
      />
      <VideoCallTrigger className={TOOL_BUTTON_CLASS} />
      <LessonTimerFab
        timer={timer}
        hideWhenIdle={!timer.isTeacher}
        className={TOOL_BUTTON_CLASS}
      />
    </div>
  );
};

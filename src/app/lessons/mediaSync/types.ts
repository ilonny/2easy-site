"use client";

export const LESSON_MEDIA_WS_PATH = "/api/lesson/media/ws";
export const LESSON_MEDIA_PLAY_EVENT = "lesson-media-play";
export const LESSON_MEDIA_CATCH_UP_MS = 90_000;

export type TLessonMediaKind = "audio" | "video";

export type TLessonMediaSyncTarget = {
  lessonId: number;
  exId: number;
  role: "teacher" | "student";
};

export type TLessonMediaAction = "play" | "pause";

export type TLessonMediaPlayDetail = {
  commandId: number;
  exId: number;
  kind: TLessonMediaKind;
  mediaIndex: number;
  positionSec: number;
  serverTimeMs: number;
  clockOffsetMs: number;
  action: TLessonMediaAction;
  /** When false, students only follow playback and are not scrolled. */
  scroll: boolean;
};

export type TLessonMediaPlayRequest = {
  lesson_id: number;
  ex_id: number;
  kind: TLessonMediaKind;
  media_index: number;
  position_sec: number;
  action: TLessonMediaAction;
  scroll: boolean;
};

export type TActiveMediaSync = {
  lessonId: number;
  exId: number;
  kind: TLessonMediaKind;
  mediaIndex: number;
};

export type TLessonTimerStatus = "idle" | "running" | "paused" | "finished";

export type TLessonTimerState = {
  commandId: number;
  status: TLessonTimerStatus;
  durationSec: number;
  endsAtMs: number | null;
  remainingMs: number | null;
  updatedAtMs: number;
  serverTimeMs: number;
  clockOffsetMs: number;
};

export const LESSON_TIMER_PRESETS_SEC = [60, 180, 300, 600] as const;

export const IDLE_LESSON_TIMER: TLessonTimerState = {
  commandId: 0,
  status: "idle",
  durationSec: 0,
  endsAtMs: null,
  remainingMs: null,
  updatedAtMs: 0,
  serverTimeMs: 0,
  clockOffsetMs: 0,
};

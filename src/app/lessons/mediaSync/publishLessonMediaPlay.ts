"use client";

import {
  LESSON_MEDIA_PLAY_EVENT,
  type TLessonMediaPlayDetail,
} from "./types";

const applied = new Set<number>();
let followedExerciseId = 0;

const deliver = (detail: TLessonMediaPlayDetail, attempt = 0) => {
  const el = document.getElementById(`ex-${detail.exId}`);
  if (!el && attempt < 40) {
    window.setTimeout(() => deliver(detail, attempt + 1), 300);
    return;
  }
  const shouldScroll =
    detail.scroll !== false || followedExerciseId !== detail.exId;
  if (shouldScroll && el) {
    followedExerciseId = detail.exId;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.dispatchEvent(
    new CustomEvent<TLessonMediaPlayDetail>(LESSON_MEDIA_PLAY_EVENT, {
      detail,
    }),
  );
};

export const publishLessonMediaPlay = (detail: TLessonMediaPlayDetail) => {
  if (!detail.commandId || !detail.exId || applied.has(detail.commandId)) return;
  if (detail.kind !== "audio" && detail.kind !== "video") return;
  applied.add(detail.commandId);
  if (applied.size > 80) {
    const oldest = applied.values().next().value;
    if (oldest) applied.delete(oldest);
  }
  deliver(detail);
};

export const syncedPositionSec = (detail: TLessonMediaPlayDetail) => {
  if (detail.action === "pause") return Math.max(0, detail.positionSec);
  const elapsedSec =
    (Date.now() + detail.clockOffsetMs - detail.serverTimeMs) / 1000;
  return Math.max(0, detail.positionSec + Math.max(0, elapsedSec));
};

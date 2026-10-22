"use client";

import { useEffect, useState } from "react";
import type { TActiveMediaSync } from "./types";

let active: TActiveMediaSync | null = null;
let suppressUntil = 0;
const listeners = new Set<() => void>();

const sameTarget = (a: TActiveMediaSync | null, b: TActiveMediaSync | null) =>
  !!a &&
  !!b &&
  a.lessonId === b.lessonId &&
  a.exId === b.exId &&
  a.kind === b.kind &&
  a.mediaIndex === b.mediaIndex;

export const getActiveMediaSync = () => active;

export const isActiveMediaSync = (target: TActiveMediaSync) => sameTarget(active, target);

export const setActiveMediaSync = (next: TActiveMediaSync | null) => {
  if (sameTarget(active, next) || (!active && !next)) return;
  active = next;
  listeners.forEach((listener) => listener());
};

export const subscribeActiveMediaSync = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const suppressTeacherSync = (ms: number) => {
  suppressUntil = Date.now() + ms;
};

export const isTeacherSyncSuppressed = () => Date.now() < suppressUntil;

export function useIsMediaSyncActive(target: TActiveMediaSync | null) {
  const [on, setOn] = useState(() => (target ? isActiveMediaSync(target) : false));
  const lessonId = target?.lessonId || 0;
  const exId = target?.exId || 0;
  const kind = target?.kind || "audio";
  const mediaIndex = target?.mediaIndex || 0;

  useEffect(() => {
    const read = () =>
      setOn(
        lessonId
          ? isActiveMediaSync({
              lessonId,
              exId,
              kind,
              mediaIndex,
            })
          : false,
      );
    read();
    return subscribeActiveMediaSync(read);
  }, [exId, kind, lessonId, mediaIndex]);

  return on;
}

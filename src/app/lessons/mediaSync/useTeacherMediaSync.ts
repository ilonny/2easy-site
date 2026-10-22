"use client";

import { useEffect, useRef } from "react";
import {
  isActiveMediaSync,
  isTeacherSyncSuppressed,
  setActiveMediaSync,
  suppressTeacherSync,
  useIsMediaSyncActive,
} from "./activeMediaSync";
import { requestSyncedPlay } from "./lessonMediaSyncClient";
import { pauseOtherMedia, restartIfEnded } from "./playElementInSync";
import type { TActiveMediaSync, TLessonMediaKind } from "./types";

type TArgs = {
  enabled: boolean;
  lessonId: number;
  exId: number;
  kind: TLessonMediaKind;
  mediaIndex: number;
  getElement: () => HTMLMediaElement | null;
  ensureSource?: () => void;
};

const waitForElement = async (
  getElement: () => HTMLMediaElement | null,
  prepare?: () => void,
) => {
  const started = Date.now();
  let el = getElement();
  while (Date.now() - started < 2500) {
    prepare?.();
    el = getElement();
    const src = el?.getAttribute("src") || "";
    if (el && src) return el;
    await new Promise((resolve) => window.setTimeout(resolve, 40));
  }
  return getElement();
};

export function useTeacherMediaSync({
  enabled,
  lessonId,
  exId,
  kind,
  mediaIndex,
  getElement,
  ensureSource,
}: TArgs) {
  const target: TActiveMediaSync | null =
    enabled && lessonId && exId
      ? { lessonId, exId, kind, mediaIndex }
      : null;
  const active = useIsMediaSyncActive(target);
  const getElementRef = useRef(getElement);
  const ensureRef = useRef(ensureSource);
  getElementRef.current = getElement;
  ensureRef.current = ensureSource;

  useEffect(() => {
    if (!active || !lessonId || !exId) return;
    const current: TActiveMediaSync = { lessonId, exId, kind, mediaIndex };
    let media: HTMLMediaElement | null = null;
    let waitTimer = 0;
    let debounce = 0;
    let stopped = false;

    const flush = () => {
      const el = getElementRef.current();
      if (!el || stopped || !isActiveMediaSync(current)) return;
      requestSyncedPlay(() => ({
        lesson_id: current.lessonId,
        ex_id: current.exId,
        kind: current.kind,
        media_index: current.mediaIndex,
        position_sec: el.currentTime || 0,
        action: el.paused ? "pause" : "play",
        scroll: false,
      }));
    };

    const schedule = (event: Event) => {
      if (event.type === "play" && isTeacherSyncSuppressed()) return;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(flush, 220);
    };

    const detach = () => {
      if (!media) return;
      media.removeEventListener("play", schedule);
      media.removeEventListener("pause", schedule);
      media.removeEventListener("seeked", schedule);
      media = null;
    };

    const attach = () => {
      if (stopped) return;
      const el = getElementRef.current();
      if (!el) {
        waitTimer = window.setTimeout(attach, 200);
        return;
      }
      if (media === el) return;
      detach();
      media = el;
      el.addEventListener("play", schedule);
      el.addEventListener("pause", schedule);
      el.addEventListener("seeked", schedule);
    };

    attach();
    return () => {
      stopped = true;
      window.clearTimeout(waitTimer);
      window.clearTimeout(debounce);
      detach();
    };
  }, [active, exId, kind, lessonId, mediaIndex]);

  const toggleSync = async () => {
    if (!target) return;
    if (isActiveMediaSync(target)) {
      setActiveMediaSync(null);
      return;
    }
    setActiveMediaSync(target);
    ensureRef.current?.();
    const el = await waitForElement(getElementRef.current, ensureRef.current);
    if (!el || !isActiveMediaSync(target)) return;
    suppressTeacherSync(800);
    restartIfEnded(el);
    pauseOtherMedia(el);
    try {
      await el.play();
    } catch {
      /* the click is a user gesture; ignore rare rejections */
    }
    const current = getElementRef.current() || el;
    requestSyncedPlay(() => ({
      lesson_id: target.lessonId,
      ex_id: target.exId,
      kind: target.kind,
      media_index: target.mediaIndex,
      position_sec: current.currentTime || 0,
      action: current.paused ? "pause" : "play",
      scroll: true,
    }));
  };

  return { active, toggleSync };
}

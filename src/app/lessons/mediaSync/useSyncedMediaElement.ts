"use client";

import { useEffect, useRef } from "react";
import { pauseElementInSync, pauseOtherMedia, playElementInSync } from "./playElementInSync";
import { LESSON_MEDIA_PLAY_EVENT, type TLessonMediaKind, type TLessonMediaPlayDetail } from "./types";

type TArgs = {
  enabled: boolean;
  exId: number;
  kind: TLessonMediaKind;
  mediaIndex: number;
  getElement: () => HTMLMediaElement | null;
  ensureSource?: () => void;
};

export function useSyncedMediaElement({
  enabled,
  exId,
  kind,
  mediaIndex,
  getElement,
  ensureSource,
}: TArgs) {
  const genRef = useRef(0);
  const getElementRef = useRef(getElement);
  const ensureRef = useRef(ensureSource);
  getElementRef.current = getElement;
  ensureRef.current = ensureSource;

  useEffect(() => {
    if (!enabled || !exId) return;

    const onPlay = (event: Event) => {
      const detail = (event as CustomEvent<TLessonMediaPlayDetail>).detail;
      if (
        !detail ||
        detail.exId !== exId ||
        detail.kind !== kind ||
        Number(detail.mediaIndex) !== mediaIndex
      ) {
        return;
      }
      const token = ++genRef.current;
      void (async () => {
        const started = Date.now();
        let el = getElementRef.current();
        while (Date.now() - started < 5000) {
          ensureRef.current?.();
          el = getElementRef.current();
          const src = el?.getAttribute("src") || "";
          if (el && src) break;
          await new Promise((resolve) => window.setTimeout(resolve, 40));
        }
        if (!el || token !== genRef.current) return;
        pauseOtherMedia(el);
        if (detail.action === "pause") {
          await pauseElementInSync(el, detail, () => token === genRef.current);
          return;
        }
        await playElementInSync(el, detail, () => token === genRef.current);
      })();
    };

    window.addEventListener(LESSON_MEDIA_PLAY_EVENT, onPlay);
    return () => window.removeEventListener(LESSON_MEDIA_PLAY_EVENT, onPlay);
  }, [enabled, exId, kind, mediaIndex]);
}

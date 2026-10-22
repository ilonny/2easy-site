"use client";

import { useEffect } from "react";
import { fetchGet } from "@/api";
import { lessonMediaSyncClient } from "./lessonMediaSyncClient";
import { publishLessonMediaPlay } from "./publishLessonMediaPlay";
import { LESSON_MEDIA_CATCH_UP_MS, type TLessonMediaKind } from "./types";

type TRole = "teacher" | "student";

export function useLessonMediaSync({
  lessonId,
  enabled,
  role,
}: {
  lessonId: number;
  enabled: boolean;
  role: TRole | null;
}) {
  useEffect(() => {
    if (!enabled || !lessonId || !role) return;
    lessonMediaSyncClient.connect(lessonId, role);
    return () => lessonMediaSyncClient.disconnect();
  }, [enabled, lessonId, role]);

  useEffect(() => {
    if (!enabled || !lessonId || role !== "student") return;
    let stop = false;
    let timer = 0;

    const tick = async () => {
      if (stop) return;
      try {
        const res = await fetchGet({
          path: `/lesson-focus?lesson_id=${lessonId}`,
          isSecure: true,
        });
        const data = await res?.json();
        const media = data?.focus?.media;
        const serverNow = Number(data?.server_now_ms || 0);
        const serverTimeMs = Number(media?.server_time_ms || 0);
        const kind: TLessonMediaKind | null =
          media?.kind === "video" ? "video" : media?.kind === "audio" ? "audio" : null;
        if (
          kind &&
          serverNow &&
          serverTimeMs &&
          serverNow - serverTimeMs < LESSON_MEDIA_CATCH_UP_MS &&
          serverNow - serverTimeMs > -5000
        ) {
          publishLessonMediaPlay({
            commandId: Number(media.command_id || 0),
            exId: Number(media.ex_id || data?.focus?.ex_id || 0),
            kind,
            mediaIndex: Number(media.media_index || 0),
            positionSec: Number(media.position_sec || 0),
            serverTimeMs,
            clockOffsetMs: serverNow - Date.now(),
            action: media.action === "pause" ? "pause" : "play",
            scroll: media.scroll !== false,
          });
        }
      } catch {
        /* ignore */
      }
      if (!stop) {
        timer = window.setTimeout(() => {
          void tick();
        }, lessonMediaSyncClient.isOpen() ? 2500 : 1000);
      }
    };

    timer = window.setTimeout(() => {
      void tick();
    }, 1000);

    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [enabled, lessonId, role]);
}

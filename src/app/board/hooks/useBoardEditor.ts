"use client";

import { useBoardContent } from "./useBoardContent";
import { useBoardRealtime } from "./useBoardRealtime";

type TUseBoardEditorParams = {
  boardId?: number;
  mode: "solo" | "realtime";
  enabled?: boolean;
  isHost?: boolean;
};

export const useBoardEditor = ({
  boardId,
  mode,
  enabled = false,
  isHost = false,
}: TUseBoardEditorParams) => {
  const isRealtime = mode === "realtime";
  const isSoloActive = enabled && !isRealtime && !!boardId;
  const isRealtimeActive = enabled && isRealtime && !!boardId;

  const solo = useBoardContent(isRealtime ? undefined : boardId, isSoloActive);
  const realtime = useBoardRealtime({
    boardId: isRealtime ? boardId : undefined,
    enabled: isRealtimeActive,
    isHost,
  });

  if (isRealtime) {
    return {
      mode: "realtime" as const,
      saveStatus: realtime.saveStatus,
      initialData: realtime.initialData,
      board: realtime.board,
      loadError: realtime.loadError,
      contentRevision: realtime.contentRevision,
      teacherCursor: realtime.teacherCursor,
      isHost,
      queueSave: realtime.queueSave,
      flushSave: realtime.flushSave,
      leaveSession: realtime.leaveSession,
    };
  }

  return {
    mode: "solo" as const,
    saveStatus: solo.saveStatus,
    initialData: solo.initialData,
    board: null,
    loadError: false,
    contentRevision: solo.contentRevision,
    teacherCursor: null,
    isHost: false,
    queueSave: solo.queueSave,
    flushSave: solo.flushSave,
    leaveSession: async () => {
      await solo.flushSave();
    },
  };
};

"use client";

import { useBoardContent } from "./useBoardContent";
import { useBoardRealtime } from "./useBoardRealtime";

type TUseBoardEditorParams = {
  boardId?: number;
  mode: "solo" | "realtime";
  enabled?: boolean;
  isHost?: boolean;
  autoStartHostSession?: boolean;
  closeSessionOnUnmount?: boolean;
};

export const useBoardEditor = ({
  boardId,
  mode,
  enabled = false,
  isHost = false,
  autoStartHostSession = true,
  closeSessionOnUnmount = true,
}: TUseBoardEditorParams) => {
  const isRealtime = mode === "realtime";
  const isSoloActive = enabled && !isRealtime && !!boardId;
  const isRealtimeActive = enabled && isRealtime && !!boardId;

  const solo = useBoardContent(isRealtime ? undefined : boardId, isSoloActive);
  const realtime = useBoardRealtime({
    boardId: isRealtime ? boardId : undefined,
    enabled: isRealtimeActive,
    isHost,
    autoStartHostSession,
    closeSessionOnUnmount,
  });

  if (isRealtime) {
    return {
      mode: "realtime" as const,
      saveStatus: realtime.saveStatus,
      initialData: realtime.initialData,
      board: realtime.board,
      loadError: realtime.loadError,
      contentRevision: realtime.contentRevision,
      cursors: realtime.cursors,
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
    board: solo.board,
    loadError: solo.loadError,
    contentRevision: solo.contentRevision,
    cursors: [],
    isHost: false,
    queueSave: solo.queueSave,
    flushSave: solo.flushSave,
    leaveSession: async () => {
      await solo.flushSave();
    },
  };
};

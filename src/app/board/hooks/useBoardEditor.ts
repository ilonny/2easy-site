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
      contentRevision: realtime.contentRevision,
      isLoading: realtime.isLoading,
      isWaitingForHost: realtime.isWaitingForHost,
      teacherCursor: realtime.teacherCursor,
      isHost,
      queueSave: realtime.queueSave,
      flushSave: realtime.flushSave,
      leaveSession: realtime.leaveSession,
      participants: realtime.participants,
      sessionStatus: realtime.sessionStatus,
    };
  }

  return {
    mode: "solo" as const,
    saveStatus: solo.saveStatus,
    initialData: solo.initialData,
    contentRevision: solo.contentRevision,
    isLoading: solo.isLoading,
    isWaitingForHost: false,
    teacherCursor: null,
    isHost: false,
    queueSave: solo.queueSave,
    flushSave: solo.flushSave,
    leaveSession: async () => {
      await solo.flushSave();
    },
    participants: [],
    sessionStatus: null,
  };
};

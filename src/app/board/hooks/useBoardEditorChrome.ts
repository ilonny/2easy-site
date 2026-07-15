"use client";

import { useBoardEditor } from "./useBoardEditor";

type TParams = {
  boardId?: number;
  mode: "solo" | "realtime";
  enabled: boolean;
  isHost?: boolean;
  autoStartHostSession?: boolean;
  closeSessionOnUnmount?: boolean;
  editorKeyPrefix: string;
};

export const useBoardEditorChrome = ({
  boardId,
  mode,
  enabled,
  isHost = false,
  autoStartHostSession = true,
  closeSessionOnUnmount = true,
  editorKeyPrefix,
}: TParams) => {
  const editor = useBoardEditor({
    boardId,
    mode,
    enabled,
    isHost,
    autoStartHostSession,
    closeSessionOnUnmount,
  });

  const isEditorReady = !!editor.initialData && !!boardId;
  const editorKey = boardId
    ? `${editorKeyPrefix}-${boardId}-${mode}`
    : editorKeyPrefix;

  return {
    editor,
    isEditorReady,
    editorKey,
  };
};

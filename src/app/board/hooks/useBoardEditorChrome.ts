"use client";

import { useMemo } from "react";
import { BOARD_EDITOR_JIVO_OFFSET_PX } from "../constants";
import { useBoardEditor } from "./useBoardEditor";
import { getBoardSaveStatusLabel } from "../utils/saveStatus";

type TParams = {
  boardId?: number;
  mode: "solo" | "realtime";
  enabled: boolean;
  isHost?: boolean;
  editorKeyPrefix: string;
};

export const useBoardEditorChrome = ({
  boardId,
  mode,
  enabled,
  isHost = false,
  editorKeyPrefix,
}: TParams) => {
  const editor = useBoardEditor({
    boardId,
    mode,
    enabled,
    isHost,
  });

  const statusLabel = useMemo(
    () => getBoardSaveStatusLabel(editor.saveStatus),
    [editor.saveStatus],
  );

  const isEditorReady = !!editor.initialData && !!boardId;
  const editorKey = boardId ? `${editorKeyPrefix}-${boardId}` : editorKeyPrefix;

  const editorAreaStyle = useMemo(
    () =>
      ({
        paddingBottom: BOARD_EDITOR_JIVO_OFFSET_PX,
        "--board-jivo-offset": `${BOARD_EDITOR_JIVO_OFFSET_PX}px`,
      }) as React.CSSProperties,
    [],
  );

  return {
    editor,
    statusLabel,
    isEditorReady,
    editorKey,
    editorAreaStyle,
  };
};

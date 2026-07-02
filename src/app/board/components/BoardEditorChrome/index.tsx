"use client";

import { FC } from "react";
import { BoardEditorShell } from "../BoardEditorShell";
import { useBoardEditor } from "../../hooks/useBoardEditor";

type TEditor = ReturnType<typeof useBoardEditor>;

type TProps = {
  boardId: number;
  editorKey: string;
  editor: TEditor;
  isEditorReady: boolean;
  statusLabel: string;
  isHost?: boolean;
};

export const BoardEditorChrome: FC<TProps> = ({
  boardId,
  editorKey,
  editor,
  isEditorReady,
  statusLabel,
  isHost = false,
}) => {
  if (!editor.initialData) {
    return null;
  }

  return (
    <BoardEditorShell
      boardId={boardId}
      editorKey={editorKey}
      contentRevision={editor.contentRevision}
      initialData={editor.initialData}
      isEditorReady={isEditorReady}
      syncMode={editor.mode}
      isHost={isHost}
      teacherCursor={editor.teacherCursor}
      statusLabel={statusLabel}
      onSceneChange={editor.queueSave}
    />
  );
};

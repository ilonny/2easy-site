"use client";

import { FC } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { BoardEditorShell } from "../BoardEditorShell";
import { useBoardEditor } from "../../hooks/useBoardEditor";

type TEditor = ReturnType<typeof useBoardEditor>;

type TProps = {
  boardId: number;
  editorKey: string;
  editor: TEditor;
  isEditorReady: boolean;
  onApiChange?: (api: ExcalidrawImperativeAPI | null) => void;
};

export const BoardEditorChrome: FC<TProps> = ({
  boardId,
  editorKey,
  editor,
  isEditorReady,
  onApiChange,
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
      cursors={editor.cursors}
      onSceneChange={editor.queueSave}
      onApiChange={onApiChange}
    />
  );
};

"use client";

import { FC } from "react";
import { T } from "@/i18n/T";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { BoardEditorShell, BoardLoadProgress } from "../BoardEditorShell";
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
    if (editor.loadError) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <T k="boards.loadError" />
        </div>
      );
    }
    return <BoardLoadProgress progress={editor.loadProgress} />;
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

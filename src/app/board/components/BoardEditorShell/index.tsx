"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import { Spinner } from "@nextui-org/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { TBoardCursor, TBoardSnapshot } from "../../types";
import { TExcalidrawInitialData } from "../../utils/boardSnapshot";
import styles from "../BoardEditor/boardEditor.module.css";

const BoardExcalidrawEditor = dynamic(
  () =>
    import("../BoardEditor/BoardExcalidrawEditor").then(
      (mod) => mod.BoardExcalidrawEditor,
    ),
  {
    ssr: false,
    loading: () => <BoardEditorSpinner />,
  },
);

const BoardEditorSpinner: FC<{ size?: "md" | "lg" }> = ({ size = "md" }) => (
  <div className={styles.editorWrap}>
    <div className={styles.editorLoading}>
      <Spinner color="primary" size={size} />
    </div>
  </div>
);

type TProps = {
  boardId: number;
  editorKey: string;
  contentRevision: number;
  initialData: TExcalidrawInitialData;
  isEditorReady: boolean;
  syncMode: "solo" | "realtime";
  cursors?: TBoardCursor[];
  onSceneChange: (snapshot: TBoardSnapshot) => void;
  onApiChange?: (api: ExcalidrawImperativeAPI | null) => void;
};

export const BoardEditorShell: FC<TProps> = ({
  boardId,
  editorKey,
  contentRevision,
  initialData,
  isEditorReady,
  syncMode,
  cursors = [],
  onSceneChange,
  onApiChange,
}) => (
  <div className={styles.editorArea}>
    {isEditorReady ? (
      <BoardExcalidrawEditor
        key={editorKey}
        boardId={boardId}
        contentRevision={contentRevision}
        initialData={initialData}
        onSceneChange={onSceneChange}
        syncMode={syncMode}
        cursors={cursors}
        onApiChange={onApiChange}
      />
    ) : (
      <BoardEditorSpinner size="lg" />
    )}
  </div>
);

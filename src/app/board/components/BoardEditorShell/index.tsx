"use client";

import dynamic from "next/dynamic";
import { FC } from "react";
import { Spinner } from "@nextui-org/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { T } from "@/i18n/T";
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

export const BoardLoadProgress: FC<{ progress?: number | null }> = ({
  progress = null,
}) => {
  const value =
    progress == null ? null : Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={styles.editorWrap}>
      <div className={styles.editorLoading}>
        <Spinner color="primary" size="lg" />
        <p className={styles.progressLabel}>
          {value == null ? (
            <T k="boards.opening" defaultText="Открытие доски…" />
          ) : (
            <T
              k="boards.openingProgress"
              values={{ progress: value }}
              defaultText={`Открытие доски… ${value}%`}
            />
          )}
        </p>
        <div className={styles.progressTrack} aria-hidden>
          <div
            className={
              value == null ? styles.progressFillIndeterminate : styles.progressFill
            }
            style={value == null ? undefined : { width: `${Math.max(value, 4)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const BoardEditorSpinner: FC<{ size?: "md" | "lg" }> = ({ size = "md" }) => (
  <div className={styles.editorWrap}>
    <div className={styles.editorLoading}>
      <Spinner color="primary" size={size} />
      <p className={styles.progressLabel}>
        <T k="boards.opening" defaultText="Открытие доски…" />
      </p>
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

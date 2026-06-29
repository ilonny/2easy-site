"use client";

import dynamic from "next/dynamic";
import { FC, ReactNode } from "react";
import { Spinner } from "@nextui-org/react";
import { TBoardSnapshot } from "../../types";
import { TExcalidrawInitialData } from "../../utils/boardSnapshot";
import styles from "../BoardEditorModal/styles.module.css";

const BoardExcalidrawEditor = dynamic(
  () =>
    import("../BoardEditorModal/BoardExcalidrawEditor").then(
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
  isWaitingForHost: boolean;
  isEditorReady: boolean;
  syncMode: "solo" | "realtime";
  statusLabel: string;
  onSceneChange: (snapshot: TBoardSnapshot) => void;
  waitingText: ReactNode;
};

export const BoardEditorShell: FC<TProps> = ({
  boardId,
  editorKey,
  contentRevision,
  initialData,
  isWaitingForHost,
  isEditorReady,
  syncMode,
  statusLabel,
  onSceneChange,
  waitingText,
}) => (
  <>
    <div className={styles.editorArea}>
      {isWaitingForHost ? (
        <div className={styles.waitingWrap}>
          <Spinner color="primary" size="lg" />
          <p className={styles.waitingText}>{waitingText}</p>
        </div>
      ) : isEditorReady ? (
        <BoardExcalidrawEditor
          key={editorKey}
          boardId={boardId}
          contentRevision={contentRevision}
          initialData={initialData}
          onSceneChange={onSceneChange}
          syncMode={syncMode}
        />
      ) : (
        <BoardEditorSpinner size="lg" />
      )}
    </div>
    {!!statusLabel && (
      <div className={styles.statusBar}>
        <span>{statusLabel}</span>
      </div>
    )}
  </>
);

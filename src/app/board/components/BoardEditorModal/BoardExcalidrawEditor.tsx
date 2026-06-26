"use client";

import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  buildBoardSnapshotFromExcalidraw,
  hasBoardSnapshotChanged,
  initialDataToBoardSnapshot,
} from "../../utils/snapshot";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
  TBoardSnapshot,
} from "../../types";
import styles from "./styles.module.css";

type TInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

type TProps = {
  boardId: number;
  contentRevision: number;
  initialData: TInitialData;
  onSceneChange: (snapshot: TBoardSnapshot) => void;
};

export const BoardExcalidrawEditor: FC<TProps> = ({
  boardId,
  contentRevision,
  initialData,
  onSceneChange,
}) => {
  const lastFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    lastFingerprintRef.current = getBoardSnapshotFingerprint(
      initialDataToBoardSnapshot(initialData),
    );
  }, [contentRevision, initialData]);

  const excalidrawInitialData = useMemo(
    () => ({
      elements: initialData.elements,
      appState: {
        ...initialData.appState,
        collaborators: new Map(),
      },
      files: initialData.files,
    }),
    [initialData],
  );

  const handleChange = useCallback(
    (
      elements: readonly unknown[],
      appState: Record<string, unknown>,
      files: Record<string, unknown>,
    ) => {
      const snapshot = buildBoardSnapshotFromExcalidraw(elements, appState, files);
      if (!hasBoardSnapshotChanged(snapshot, lastFingerprintRef.current)) {
        return;
      }

      lastFingerprintRef.current = getBoardSnapshotFingerprint(snapshot);
      onSceneChange(snapshot);
    },
    [onSceneChange],
  );

  return (
    <div className={styles.editorWrap}>
      <Excalidraw
        key={`board-excalidraw-${boardId}-${contentRevision}`}
        initialData={excalidrawInitialData}
        onChange={handleChange}
      >
        <MainMenu />
      </Excalidraw>
    </div>
  );
};

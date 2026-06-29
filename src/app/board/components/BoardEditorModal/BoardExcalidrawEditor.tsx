"use client";

import {
  CaptureUpdateAction,
  Excalidraw,
  MainMenu,
  reconcileElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  augmentRemoteElementsWithDeletions,
  buildBoardSnapshotFromExcalidraw,
  hasBoardSnapshotChanged,
  initialDataToBoardSnapshot,
} from "../../utils/snapshot";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
} from "../../utils/boardSnapshot";
import { TBoardSnapshot } from "../../types";
import styles from "./styles.module.css";

type TInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

type TProps = {
  boardId: number;
  contentRevision: number;
  initialData: TInitialData;
  onSceneChange: (snapshot: TBoardSnapshot) => void;
  syncMode?: "solo" | "realtime";
};

export const BoardExcalidrawEditor: FC<TProps> = ({
  boardId,
  contentRevision,
  initialData,
  onSceneChange,
  syncMode = "solo",
}) => {
  const lastFingerprintRef = useRef<string | null>(null);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastAppliedRevisionRef = useRef(-1);
  const isApplyingRemoteRef = useRef(false);
  const isRealtime = syncMode === "realtime";

  const applyRemoteScene = useCallback(
    (data: TInitialData, revision: number) => {
      const api = excalidrawAPIRef.current;
      if (!api || revision <= lastAppliedRevisionRef.current) {
        return;
      }

      const remoteSnapshot = initialDataToBoardSnapshot(data);

      if (lastAppliedRevisionRef.current < 0) {
        lastAppliedRevisionRef.current = revision;
        lastFingerprintRef.current = getBoardSnapshotFingerprint(remoteSnapshot);
        return;
      }

      lastAppliedRevisionRef.current = revision;

      const localElements = api.getSceneElementsIncludingDeleted();
      const remoteElements = augmentRemoteElementsWithDeletions(
        localElements,
        remoteSnapshot.elements as never,
      );

      const reconciled = reconcileElements(
        localElements,
        remoteElements as never,
        api.getAppState(),
      );

      isApplyingRemoteRef.current = true;
      api.updateScene({
        elements: reconciled,
        captureUpdate: CaptureUpdateAction.NEVER,
      });

      const remoteFiles = Object.values(data.files || {});
      if (remoteFiles.length) {
        api.addFiles(remoteFiles as never);
      }

      lastFingerprintRef.current = getBoardSnapshotFingerprint(remoteSnapshot);
      isApplyingRemoteRef.current = false;
    },
    [],
  );

  useEffect(() => {
    if (isRealtime) {
      applyRemoteScene(initialData, contentRevision);
      return;
    }

    lastFingerprintRef.current = getBoardSnapshotFingerprint(
      initialDataToBoardSnapshot(initialData),
    );
  }, [applyRemoteScene, contentRevision, initialData, isRealtime]);

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
      if (isApplyingRemoteRef.current) {
        return;
      }

      const snapshot = buildBoardSnapshotFromExcalidraw(elements, appState, files);
      if (!hasBoardSnapshotChanged(snapshot, lastFingerprintRef.current)) {
        return;
      }

      lastFingerprintRef.current = getBoardSnapshotFingerprint(snapshot);
      onSceneChange(snapshot);
    },
    [onSceneChange],
  );

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      excalidrawAPIRef.current = api;
      if (isRealtime) {
        applyRemoteScene(initialData, contentRevision);
      }
    },
    [applyRemoteScene, contentRevision, initialData, isRealtime],
  );

  const excalidrawKey = isRealtime
    ? `board-excalidraw-${boardId}`
    : `board-excalidraw-${boardId}-${contentRevision}`;

  return (
    <div className={styles.editorWrap}>
      <Excalidraw
        key={excalidrawKey}
        excalidrawAPI={isRealtime ? handleExcalidrawAPI : undefined}
        initialData={excalidrawInitialData}
        onChange={handleChange}
      >
        <MainMenu />
      </Excalidraw>
    </div>
  );
};

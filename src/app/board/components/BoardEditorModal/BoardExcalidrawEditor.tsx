"use client";

import {
  CaptureUpdateAction,
  Excalidraw,
  reconcileElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { mergeBoardEditorAppState } from "../../utils/boardEditorDefaults";
import { attachFitBoardViewportOnLoad } from "../../utils/boardStickyNote";
import { buildTeacherCollaboratorsMap } from "../../utils/boardTeacherCursor";
import { multiplayerBoardSyncAdapter } from "../../sync/MultiplayerBoardSyncAdapter";
import { BOARD_CURSOR_THROTTLE_MS } from "../../constants";
import { BoardStickyNoteButton } from "../BoardStickyNoteButton";
import { TBoardSnapshot, TBoardTeacherCursor } from "../../types";
import styles from "./styles.module.css";

type TInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

type TProps = {
  boardId: number;
  contentRevision: number;
  initialData: TInitialData;
  onSceneChange: (snapshot: TBoardSnapshot) => void;
  syncMode?: "solo" | "realtime";
  isHost?: boolean;
  teacherCursor?: TBoardTeacherCursor | null;
};

export const BoardExcalidrawEditor: FC<TProps> = ({
  boardId,
  contentRevision,
  initialData,
  onSceneChange,
  syncMode = "solo",
  isHost = false,
  teacherCursor = null,
}) => {
  const lastFingerprintRef = useRef<string | null>(null);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastAppliedRevisionRef = useRef(-1);
  const isApplyingRemoteRef = useRef(false);
  const isRealtime = syncMode === "realtime";
  const shouldFitViewportRef = useRef(true);
  const fitViewportUnsubscribeRef = useRef<(() => void) | null>(null);
  const lastCursorSentAtRef = useRef(0);
  const teacherCursorRef = useRef(teacherCursor);
  const isHostRef = useRef(isHost);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const excalidrawKey = isRealtime
    ? `board-excalidraw-${boardId}`
    : `board-excalidraw-${boardId}-${contentRevision}`;

  const fitViewportIfNeeded = useCallback((api: ExcalidrawImperativeAPI) => {
    fitViewportUnsubscribeRef.current?.();
    fitViewportUnsubscribeRef.current = null;

    fitViewportUnsubscribeRef.current = attachFitBoardViewportOnLoad(
      api,
      () => shouldFitViewportRef.current,
      () => {
        shouldFitViewportRef.current = false;
        fitViewportUnsubscribeRef.current?.();
        fitViewportUnsubscribeRef.current = null;
      },
    );
  }, []);

  useEffect(() => {
    shouldFitViewportRef.current = true;
    fitViewportUnsubscribeRef.current?.();
    fitViewportUnsubscribeRef.current = null;
    setExcalidrawAPI(null);
  }, [excalidrawKey]);

  useEffect(
    () => () => {
      fitViewportUnsubscribeRef.current?.();
      fitViewportUnsubscribeRef.current = null;
    },
    [],
  );

  useEffect(() => {
    teacherCursorRef.current = teacherCursor;
  }, [teacherCursor]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

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
        appState: {
          ...mergeBoardEditorAppState(remoteSnapshot.appState as Record<string, unknown>),
          ...(!isHostRef.current && isRealtime
            ? {
                collaborators: buildTeacherCollaboratorsMap(
                  teacherCursorRef.current,
                ),
              }
            : {}),
        },
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

  useEffect(() => {
    const api = excalidrawAPIRef.current;
    if (!api || !isRealtime || isHost) {
      return;
    }

    api.updateScene({
      appState: {
        collaborators: buildTeacherCollaboratorsMap(teacherCursor),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }, [excalidrawAPI, isHost, isRealtime, teacherCursor]);

  const excalidrawInitialData = useMemo(
    () => ({
      elements: initialData.elements,
      appState: {
        ...mergeBoardEditorAppState(initialData.appState as Record<string, unknown>),
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

  const handlePointerUpdate = useCallback(
    (payload: {
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "down" | "up";
    }) => {
      if (!isRealtime || !isHost || !multiplayerBoardSyncAdapter.isConnected()) {
        return;
      }

      const now = Date.now();
      if (now - lastCursorSentAtRef.current < BOARD_CURSOR_THROTTLE_MS) {
        return;
      }
      lastCursorSentAtRef.current = now;

      multiplayerBoardSyncAdapter.sendCursor({
        x: payload.pointer.x,
        y: payload.pointer.y,
        tool: payload.pointer.tool,
        button: payload.button,
      });
    },
    [isHost, isRealtime],
  );

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      excalidrawAPIRef.current = api;
      setExcalidrawAPI(api);
      if (isRealtime) {
        applyRemoteScene(initialData, contentRevision);
      }
      fitViewportIfNeeded(api);
    },
    [
      applyRemoteScene,
      contentRevision,
      fitViewportIfNeeded,
      initialData,
      isRealtime,
    ],
  );

  return (
    <div className={styles.editorWrap} data-board-editor-wrap>
      <BoardStickyNoteButton api={excalidrawAPI} />
      <Excalidraw
        key={excalidrawKey}
        excalidrawAPI={handleExcalidrawAPI}
        initialData={excalidrawInitialData}
        gridModeEnabled
        isCollaborating={isRealtime && !isHost}
        onChange={handleChange}
        onPointerUpdate={isRealtime && isHost ? handlePointerUpdate : undefined}
        UIOptions={{
          tools: {
            image: true,
          },
        }}
      />
    </div>
  );
};

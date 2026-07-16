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
} from "../../utils/excalidrawSnapshot";
import {
  getBoardSnapshotFingerprint,
  snapshotToExcalidrawInitialData,
} from "../../utils/boardSnapshot";
import { mergeBoardEditorAppState } from "../../utils/boardEditorDefaults";
import { attachFitBoardViewportOnLoad } from "../../utils/boardViewport";
import { buildBoardCollaboratorsMap } from "../../utils/boardTeacherCursor";
import { multiplayerBoardSyncAdapter } from "../../sync/MultiplayerBoardSyncAdapter";
import { BOARD_CURSOR_THROTTLE_MS } from "../../constants";
import { useAutoFinalizeLineTool } from "../../hooks/useAutoFinalizeLineTool";
import { useBoardToolbarContainer } from "../../hooks/useBoardToolbarContainer";
import { BoardStickyNoteButton } from "../BoardStickyNoteButton";
import { TBoardCursor, TBoardSnapshot } from "../../types";
import styles from "./boardEditor.module.css";

type TInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

type TProps = {
  boardId: number;
  contentRevision: number;
  initialData: TInitialData;
  onSceneChange: (snapshot: TBoardSnapshot) => void;
  syncMode?: "solo" | "realtime";
  cursors?: TBoardCursor[];
  onApiChange?: (api: ExcalidrawImperativeAPI | null) => void;
};

const BOARD_UI_TOOLS = {
  image: true,
  diamond: false,
  ellipse: false,
  arrow: false,
  eraser: false,
  frame: false,
  embeddable: false,
} as { image: boolean };

export const BoardExcalidrawEditor: FC<TProps> = ({
  boardId,
  contentRevision,
  initialData,
  onSceneChange,
  syncMode = "solo",
  cursors = [],
  onApiChange,
}) => {
  const lastFingerprintRef = useRef<string | null>(null);
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastAppliedRevisionRef = useRef(-1);
  const isApplyingRemoteRef = useRef(false);
  const isRealtime = syncMode === "realtime";
  const shouldFitViewportRef = useRef(true);
  const fitViewportUnsubscribeRef = useRef<(() => void) | null>(null);
  const lastCursorSentAtRef = useRef(0);
  const cursorsRef = useRef(cursors);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const toolbarContainer = useBoardToolbarContainer(
    excalidrawAPI,
    editorWrapRef,
  );
  useAutoFinalizeLineTool(excalidrawAPI, editorWrapRef);

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
    cursorsRef.current = cursors;
  }, [cursors]);

  useEffect(() => {
    onApiChange?.(excalidrawAPI);
    return () => onApiChange?.(null);
  }, [excalidrawAPI, onApiChange]);

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
          ...(isRealtime
            ? {
                collaborators: buildBoardCollaboratorsMap(cursorsRef.current),
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
    if (!api || !isRealtime) {
      return;
    }

    api.updateScene({
      appState: {
        collaborators: buildBoardCollaboratorsMap(cursors),
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }, [cursors, excalidrawAPI, isRealtime]);

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
      if (!isRealtime || !multiplayerBoardSyncAdapter.isConnected()) {
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
    [isRealtime],
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
    <div className={styles.editorWrap} data-board-editor-wrap ref={editorWrapRef}>
      <BoardStickyNoteButton api={excalidrawAPI} container={toolbarContainer} />
      <Excalidraw
        key={excalidrawKey}
        excalidrawAPI={handleExcalidrawAPI}
        initialData={excalidrawInitialData}
        gridModeEnabled
        // Presentational only: renders the standalone laser toolbar button.
        isCollaborating
        onChange={handleChange}
        onPointerUpdate={isRealtime ? handlePointerUpdate : undefined}
        UIOptions={{
          tools: BOARD_UI_TOOLS,
        }}
      />
    </div>
  );
};

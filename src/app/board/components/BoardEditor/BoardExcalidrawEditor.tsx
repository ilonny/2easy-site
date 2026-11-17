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
  buildBoardSnapshotFromExcalidraw,
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
import { useDisableBrowserHistorySwipe } from "../../hooks/useDisableBrowserHistorySwipe";
import { BoardStickyNoteButton } from "../BoardStickyNoteButton";
import { TextFormatBar } from "../TextFormatBar";
import { useVisibleBoardFiles } from "../../hooks/useVisibleBoardFiles";
import { T } from "@/i18n/T";
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

const BOARD_GRID_MIN_ZOOM = 0.15;

if (typeof window !== "undefined") {
  (
    window as Window & { EXCALIDRAW_THROTTLE_RENDER?: boolean }
  ).EXCALIDRAW_THROTTLE_RENDER = true;
}

/** Element versions change only when the drawing changes, not while panning. */
const sceneEditKey = (elements: readonly unknown[]) => {
  let key = elements.length;
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index] as {
      version?: number;
      versionNonce?: number;
    };
    key =
      (key + (element.version || 0) * 131 + (element.versionNonce || 0)) | 0;
  }
  return key;
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
  const lastEditKeyRef = useRef<number | null>(null);
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
  const imageProgress = useVisibleBoardFiles(excalidrawAPI, boardId);
  useAutoFinalizeLineTool(excalidrawAPI, editorWrapRef);
  useDisableBrowserHistorySwipe();

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
    lastEditKeyRef.current = sceneEditKey(initialData.elements);
  }, [initialData]);

  useEffect(() => {
    if (!excalidrawAPI) return;
    const syncGrid = () => {
      const appState = excalidrawAPI.getAppState();
      const zoom = appState.zoom?.value || 1;
      const wantGrid = zoom >= BOARD_GRID_MIN_ZOOM;
      if (appState.gridModeEnabled === wantGrid) return;
      excalidrawAPI.updateScene({
        appState: { gridModeEnabled: wantGrid },
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    };
    const unsubscribe = excalidrawAPI.onScrollChange(syncGrid);
    syncGrid();
    return unsubscribe;
  }, [excalidrawAPI]);

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

      const reconciled = reconcileElements(
        api.getSceneElementsIncludingDeleted(),
        remoteSnapshot.elements as never,
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

      const remoteFiles = Object.values(data.files || {}).filter((file) => {
        return (
          !!file &&
          typeof file === "object" &&
          typeof (file as { dataURL?: unknown }).dataURL === "string"
        );
      });
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

      const editKey = sceneEditKey(elements);
      if (editKey === lastEditKeyRef.current) {
        return;
      }
      lastEditKeyRef.current = editKey;

      const snapshot = buildBoardSnapshotFromExcalidraw(elements, appState, files);
      const fingerprint = getBoardSnapshotFingerprint(snapshot);
      if (fingerprint === lastFingerprintRef.current) {
        return;
      }

      lastFingerprintRef.current = fingerprint;
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
      <TextFormatBar api={excalidrawAPI} editorWrapRef={editorWrapRef} />
      <BoardStickyNoteButton api={excalidrawAPI} container={toolbarContainer} />
      {imageProgress && imageProgress.loaded < imageProgress.total ? (
        <>
          <div className={styles.imageProgress}>
            <span className={styles.imageSpinner} aria-hidden />
            <T
              k="boards.loadingImages"
              values={imageProgress}
              defaultText={`Изображения ${imageProgress.loaded} из ${imageProgress.total}`}
            />
          </div>
          {imageProgress.slots.map((slot) => (
            <div
              key={slot.id}
              className={styles.imageSlotLoader}
              style={{
                left: slot.x,
                top: slot.y,
                width: slot.width,
                height: slot.height,
              }}
            >
              <span className={styles.imageSpinner} aria-hidden />
            </div>
          ))}
        </>
      ) : null}
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

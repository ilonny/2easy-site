"use client";

import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { FC, useCallback, useMemo } from "react";
import { snapshotToExcalidrawInitialData, TBoardSnapshot } from "../../types";
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
    (elements: readonly unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      try {
        const serialized = serializeAsJSON(
          elements as never,
          appState as never,
          files as never,
          "database",
        );
        const parsed = JSON.parse(serialized) as {
          elements?: unknown[];
          files?: Record<string, unknown>;
          appState?: Record<string, unknown>;
        };
        onSceneChange({
          format: "excalidraw",
          elements: parsed.elements || [],
          files: parsed.files || {},
          appState: parsed.appState || {},
        });
      } catch {
        onSceneChange({
          format: "excalidraw",
          elements: [...elements],
          files,
          appState,
        });
      }
    },
    [onSceneChange],
  );

  return (
    <div className={styles.editorWrap}>
      <Excalidraw
        key={`board-excalidraw-${boardId}-${contentRevision}`}
        initialData={excalidrawInitialData}
        onChange={handleChange}
      />
    </div>
  );
};

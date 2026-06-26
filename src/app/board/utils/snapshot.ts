import { serializeAsJSON } from "@excalidraw/excalidraw";
import {
  getBoardSnapshotFingerprint,
  normalizeBoardSnapshot,
  snapshotToExcalidrawInitialData,
  TBoardSnapshot,
} from "../types";

type TExcalidrawInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

export const initialDataToBoardSnapshot = (
  initialData: TExcalidrawInitialData,
): TBoardSnapshot => ({
  format: "excalidraw",
  elements: initialData.elements,
  files: (initialData.files || {}) as Record<string, unknown>,
  appState: (initialData.appState || {}) as Record<string, unknown>,
});

export const buildBoardSnapshotFromExcalidraw = (
  elements: readonly unknown[],
  appState: Record<string, unknown>,
  files: Record<string, unknown>,
): TBoardSnapshot => {
  try {
    const serialized = serializeAsJSON(
      elements as never,
      appState as never,
      files as never,
      "database",
    );
    return normalizeBoardSnapshot(JSON.parse(serialized));
  } catch {
    return normalizeBoardSnapshot({
      format: "excalidraw",
      elements: [...elements],
      files,
      appState,
    });
  }
};

export const hasBoardSnapshotChanged = (
  snapshot: TBoardSnapshot,
  previousFingerprint: string | null,
): boolean => getBoardSnapshotFingerprint(snapshot) !== previousFingerprint;

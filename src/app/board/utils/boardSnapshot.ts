import { TBoardSnapshot } from "../types";

export const EMPTY_BOARD_SNAPSHOT: TBoardSnapshot = {
  format: "excalidraw",
  elements: [],
  files: {},
  appState: {},
};

export const normalizeBoardSnapshot = (raw?: unknown): TBoardSnapshot => {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_BOARD_SNAPSHOT };
  }
  const data = raw as Partial<TBoardSnapshot>;
  return {
    format: "excalidraw",
    elements: Array.isArray(data.elements) ? data.elements : [],
    files:
      data.files && typeof data.files === "object"
        ? (data.files as Record<string, unknown>)
        : {},
    appState:
      data.appState && typeof data.appState === "object"
        ? (data.appState as Record<string, unknown>)
        : {},
  };
};

export const snapshotToExcalidrawInitialData = (snapshot: TBoardSnapshot) => ({
  elements: snapshot.elements as never[],
  files: snapshot.files as never,
  appState: snapshot.appState as never,
});

export type TExcalidrawInitialData = ReturnType<typeof snapshotToExcalidrawInitialData>;

export const getBoardSnapshotFingerprint = (snapshot: TBoardSnapshot): string =>
  JSON.stringify({
    format: snapshot.format,
    elements: snapshot.elements,
    files: snapshot.files,
    appState: snapshot.appState,
  });

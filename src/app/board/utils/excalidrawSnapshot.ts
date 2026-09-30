import { serializeAsJSON } from "@excalidraw/excalidraw";
import {
  normalizeBoardSnapshot,
  type TExcalidrawInitialData,
} from "./boardSnapshot";
import { TBoardSnapshot } from "../types";

/**
 * Deleted elements are synced as tombstones so peers can tell "erased" from
 * "not received yet". Old tombstones are dropped to keep the payload bounded.
 */
const DELETED_ELEMENT_TTL_MS = 24 * 60 * 60 * 1000;

type TExcalidrawElementLike = {
  id: string;
  isDeleted?: boolean;
  updated?: number;
  fileId?: string | null;
};

export const initialDataToBoardSnapshot = (
  initialData: TExcalidrawInitialData,
): TBoardSnapshot => ({
  format: "excalidraw",
  elements: initialData.elements,
  files: (initialData.files || {}) as Record<string, unknown>,
  appState: (initialData.appState || {}) as Record<string, unknown>,
});

const pickSyncableElements = (
  elements: readonly TExcalidrawElementLike[],
): TExcalidrawElementLike[] => {
  const deletedCutoff = Date.now() - DELETED_ELEMENT_TTL_MS;
  return elements.filter(
    (element) => !element.isDeleted || (element.updated ?? 0) > deletedCutoff,
  );
};

const pickReferencedFiles = (
  elements: readonly TExcalidrawElementLike[],
  files: Record<string, unknown>,
): Record<string, unknown> => {
  const referenced: Record<string, unknown> = {};
  for (const element of elements) {
    if (!element.isDeleted && element.fileId && files[element.fileId]) {
      referenced[element.fileId] = files[element.fileId];
    }
  }
  return referenced;
};

const pickExportAppState = (
  appState: Record<string, unknown>,
): Record<string, unknown> => {
  try {
    const serialized = serializeAsJSON([], appState as never, {}, "local");
    return JSON.parse(serialized).appState ?? {};
  } catch {
    return {};
  }
};

export const buildBoardSnapshotFromExcalidraw = (
  elements: readonly unknown[],
  appState: Record<string, unknown>,
  files: Record<string, unknown>,
): TBoardSnapshot => {
  const syncableElements = pickSyncableElements(
    elements as readonly TExcalidrawElementLike[],
  );
  return normalizeBoardSnapshot({
    format: "excalidraw",
    elements: JSON.parse(JSON.stringify(syncableElements)),
    files: pickReferencedFiles(syncableElements, files),
    appState: pickExportAppState(appState),
  });
};

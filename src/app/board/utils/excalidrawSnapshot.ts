import { serializeAsJSON } from "@excalidraw/excalidraw";
import {
  getBoardSnapshotFingerprint,
  normalizeBoardSnapshot,
  snapshotToExcalidrawInitialData,
  type TExcalidrawInitialData,
} from "./boardSnapshot";
import { TBoardSnapshot } from "../types";

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
    // "local" keeps image binaries in `files`; "database" strips them for Excalidraw cloud.
    const serialized = serializeAsJSON(
      elements as never,
      appState as never,
      files as never,
      "local",
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

type TExcalidrawElementLike = {
  id: string;
  isDeleted?: boolean;
  version: number;
  versionNonce: number;
  updated?: number;
};

/**
 * Excalidraw DB serialization drops erased elements entirely. reconcileElements
 * keeps local elements missing from remote, so erasures never reach peers unless
 * we synthesize deletion tombstones for locals absent from the remote snapshot.
 */
export const augmentRemoteElementsWithDeletions = <
  T extends TExcalidrawElementLike,
>(
  localElements: readonly T[],
  remoteElements: readonly T[],
): T[] => {
  const remoteIds = new Set(remoteElements.map((el) => el.id));
  const tombstones = localElements
    .filter((el) => !remoteIds.has(el.id) && !el.isDeleted)
    .map((el) => ({
      ...el,
      isDeleted: true,
      version: el.version + 1,
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: Date.now(),
    }));

  return tombstones.length
    ? [...remoteElements, ...tombstones]
    : [...remoteElements];
};

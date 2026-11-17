import { TBoardSnapshot } from "../types";

type TStashedFile = {
  file: Record<string, unknown>;
  pristine: boolean;
};

const stores = new Map<number, Map<string, TStashedFile>>();

const storeFor = (boardId: number) => {
  let store = stores.get(boardId);
  if (!store) {
    store = new Map();
    stores.set(boardId, store);
  }
  return store;
};

export const resetBoardFileStore = (boardId: number) => {
  stores.delete(boardId);
};

export const getStashedFile = (boardId: number, fileId: string) =>
  stores.get(boardId)?.get(fileId)?.file;

export const stashBoardFile = (
  boardId: number,
  fileId: string,
  file: Record<string, unknown>,
  pristine: boolean,
) => {
  if (!boardId || !fileId) return;
  const current = storeFor(boardId).get(fileId);
  storeFor(boardId).set(fileId, {
    file,
    pristine: pristine && (current?.pristine ?? true),
  });
};

export const stashAndStripSnapshot = (
  boardId: number,
  snapshot: TBoardSnapshot,
): TBoardSnapshot => {
  const files = snapshot.files || {};
  const lite: Record<string, unknown> = {};
  for (const [id, file] of Object.entries(files)) {
    if (!file || typeof file !== "object") continue;
    const record = file as Record<string, unknown>;
    if (typeof record.dataURL === "string" && record.dataURL) {
      stashBoardFile(boardId, id, record, true);
    }
    const { dataURL: _dataURL, ...rest } = record;
    lite[id] = rest;
  }
  return { ...snapshot, files: lite };
};

const isLiveImage = (element: unknown) => {
  if (!element || typeof element !== "object") return null;
  const image = element as {
    type?: string;
    isDeleted?: boolean;
    fileId?: string | null;
  };
  if (image.type !== "image" || image.isDeleted || !image.fileId) return null;
  return String(image.fileId);
};

/** Drop binaries the server already has. Keep new images and a stub for every visible file id. */
export const snapshotForSave = (
  boardId: number,
  snapshot: TBoardSnapshot,
): TBoardSnapshot => {
  const files: Record<string, unknown> = {};
  const store = stores.get(boardId);

  for (const [id, file] of Object.entries(snapshot.files || {})) {
    if (!file || typeof file !== "object") continue;
    const record = { ...(file as Record<string, unknown>) };
    const stashed = store?.get(id);
    if (stashed?.pristine) {
      delete record.dataURL;
    }
    files[id] = record;
  }

  for (const element of snapshot.elements) {
    const fileId = isLiveImage(element);
    if (!fileId || files[fileId]) continue;
    const stashed = store?.get(fileId);
    const stub = { ...(stashed?.file || {}), id: fileId };
    delete (stub as { dataURL?: unknown }).dataURL;
    files[fileId] = stub;
  }

  return { ...snapshot, files };
};

export const snapshotForRealtime = (
  boardId: number,
  snapshot: TBoardSnapshot,
  filesOmitted: boolean,
) => {
  const lite = snapshotForSave(boardId, snapshot);
  if (filesOmitted) return { snapshot: lite, complete: true };

  const store = stores.get(boardId);
  const files = { ...lite.files };
  let complete = true;
  for (const [id, file] of Object.entries(files)) {
    const record =
      file && typeof file === "object" ? (file as Record<string, unknown>) : {};
    const dataURL = record.dataURL;
    if (typeof dataURL === "string" && dataURL) continue;
    const stashed = store?.get(id)?.file.dataURL;
    if (typeof stashed === "string" && stashed) {
      files[id] = { ...store?.get(id)?.file, ...record, dataURL: stashed };
      continue;
    }
    complete = false;
  }

  return {
    snapshot: { ...lite, files } as TBoardSnapshot,
    complete,
  };
};

export type TScenePoint = { x: number; y: number; width: number; height: number };

export const visibleImageFileIds = (
  elements: readonly unknown[],
  view: { left: number; top: number; right: number; bottom: number },
  zoom = 1,
) => {
  const ids: string[] = [];
  const seen = new Set<string>();
  // At a far zoom-out the whole board is "visible", but tiny pictures are not
  // worth their bytes. Load an image once it is large enough to read.
  const minSceneSize = 80 / Math.max(zoom, 0.01);
  for (const element of elements) {
    if (!element || typeof element !== "object") continue;
    const image = element as {
      type?: string;
      isDeleted?: boolean;
      fileId?: string | null;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      angle?: number;
    };
    if (image.type !== "image" || image.isDeleted || !image.fileId) continue;
    const width = Number(image.width || 0);
    const height = Number(image.height || 0);
    if (width < minSceneSize && height < minSceneSize) continue;
    const extra = image.angle ? Math.hypot(width, height) : 0;
    const left = Number(image.x || 0) - extra;
    const top = Number(image.y || 0) - extra;
    const right = left + width + extra * 2;
    const bottom = top + height + extra * 2;
    if (right < view.left || left > view.right || bottom < view.top || top > view.bottom) {
      continue;
    }
    const fileId = String(image.fileId);
    if (seen.has(fileId)) continue;
    seen.add(fileId);
    ids.push(fileId);
  }
  return ids;
};

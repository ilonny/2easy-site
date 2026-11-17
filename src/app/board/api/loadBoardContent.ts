import { getTokenFromLocalStorage } from "@/auth/utils";
import { TBoard, TBoardSnapshot } from "../types";
import { normalizeBoardSnapshot } from "../utils/boardSnapshot";
import { publishBoardProgress } from "../utils/boardOpenProgress";

export const boardAuthHeaders = () => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${getTokenFromLocalStorage() || ""}`);
  return headers;
};

type TBoardLiteEvent =
  | { type: "meta"; board: TBoard }
  | { type: "scene"; elements: unknown[]; appState: Record<string, unknown> }
  | { type: "progress"; loaded: number; total: number | null }
  | { type: "done"; version: number; filesOmitted: boolean }
  | { type: "error"; message: string };

export type TBoardLoadHandlers = {
  onProgress?: (progress: number | null) => void;
  onBoard?: (board: TBoard) => void;
  onScene?: (snapshot: TBoardSnapshot) => void;
  onDone?: (result: { version: number; filesOmitted: boolean }) => void;
};

const progressPercent = (loaded: number, total: number | null) => {
  if (!total || total <= 0) return null;
  return Math.max(1, Math.min(99, Math.round((loaded / total) * 100)));
};

export const loadBoardDetail = async (
  boardId: number,
  handlers: TBoardLoadHandlers = {},
) => {
  publishBoardProgress(0, "download");
  handlers.onProgress?.(0);

  const res = await fetch(`/api/board-lite?id=${boardId}`, {
    headers: boardAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok || !res.body) {
    throw new Error("load failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let opened = false;
  let version = 0;
  let filesOmitted = false;
  let sawDone = false;

  const handle = (event: TBoardLiteEvent) => {
    if (event.type === "progress" && !opened) {
      const progress = progressPercent(event.loaded, event.total);
      handlers.onProgress?.(progress);
      publishBoardProgress(progress, "download");
      return;
    }
    if (event.type === "meta" && event.board) {
      handlers.onBoard?.(event.board);
      return;
    }
    if (event.type === "scene") {
      opened = true;
      handlers.onProgress?.(100);
      publishBoardProgress(100, "ready");
      handlers.onScene?.(
        normalizeBoardSnapshot({
          format: "excalidraw",
          elements: event.elements,
          files: {},
          appState: event.appState,
        }),
      );
      return;
    }
    if (event.type === "done") {
      sawDone = true;
      version = Number(event.version || 0);
      filesOmitted = !!event.filesOmitted;
      handlers.onDone?.({ version, filesOmitted });
      return;
    }
    if (event.type === "error") {
      throw new Error(event.message || "load failed");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: !done });
    let newline = buffer.indexOf("\n");
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) handle(JSON.parse(line) as TBoardLiteEvent);
      newline = buffer.indexOf("\n");
    }
    if (done) break;
  }

  const tail = buffer.trim();
  if (tail) handle(JSON.parse(tail) as TBoardLiteEvent);
  if (!opened || !sawDone) {
    throw new Error("load failed");
  }

  return { version, filesOmitted };
};

export const saveBoardDetail = async (
  boardId: number,
  data: TBoardSnapshot,
  clientVersion: number,
) => {
  const res = await fetch("/api/board-save", {
    method: "POST",
    headers: boardAuthHeaders(),
    body: JSON.stringify({
      board_id: boardId,
      data,
      client_version: clientVersion,
    }),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
};

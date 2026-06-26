import { fetchGet, fetchPostJson } from "@/api";
import {
  BoardContentConflictError,
  IBoardSyncAdapter,
  TBoardLoadResult,
} from "./types";
import { normalizeBoardSnapshot, TBoardSnapshot } from "../types";

export const soloBoardSyncAdapter: IBoardSyncAdapter = {
  mode: "solo",

  async load(boardId: number): Promise<TBoardLoadResult> {
    const res = await fetchGet({
      path: `/board?id=${boardId}`,
      isSecure: true,
    });
    const json = await res?.json();
    if (!json?.success) {
      throw new Error(json?.message || "Failed to load board");
    }
    return {
      data: normalizeBoardSnapshot(json.content?.data),
      version: Number(json.content?.version || 0),
    };
  },

  async save(
    boardId: number,
    data: TBoardSnapshot,
    clientVersion: number,
  ): Promise<number> {
    const res = await fetchPostJson({
      path: "/board/save-content",
      isSecure: true,
      data: {
        board_id: boardId,
        data,
        client_version: clientVersion,
      },
    });

    if (res.status === 409) {
      const json = await res.json();
      throw new BoardContentConflictError({
        data: normalizeBoardSnapshot(json?.content?.data),
        version: Number(json?.content?.version || 0),
      });
    }

    const json = await res.json();
    if (!json?.success) {
      throw new Error(json?.message || "Failed to save board");
    }
    return Number(json.version || 0);
  },
};

import { fetchPostJson } from "@/api";
import { loadBoardContent } from "../api/loadBoardContent";
import {
  BoardContentConflictError,
  IBoardSyncAdapter,
  TBoardLoadResult,
} from "./types";
import { normalizeBoardSnapshot } from "../utils/boardSnapshot";
import { TBoardSnapshot } from "../types";
import i18n from "@/i18n/config";

export const soloBoardSyncAdapter: IBoardSyncAdapter = {
  mode: "solo",

  async load(boardId: number): Promise<TBoardLoadResult> {
    const content = await loadBoardContent(boardId);
    if (!content) {
      throw new Error(i18n.t("boards.loadError"));
    }
    return content;
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
      throw new Error(json?.message || i18n.t("boards.saveError"));
    }
    return Number(json.version || 0);
  },
};

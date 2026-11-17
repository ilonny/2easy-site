"use client";

import { loadBoardDetail, saveBoardDetail } from "../api/loadBoardContent";
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
    let snapshot: TBoardSnapshot | null = null;
    let version = 0;
    await loadBoardDetail(boardId, {
      onScene: (data) => {
        snapshot = data;
      },
      onDone: (result) => {
        version = result.version;
      },
    });
    if (!snapshot) {
      throw new Error(i18n.t("boards.loadError"));
    }
    return { data: snapshot, version };
  },

  async save(
    boardId: number,
    data: TBoardSnapshot,
    clientVersion: number,
  ): Promise<number> {
    const { status, json } = await saveBoardDetail(boardId, data, clientVersion);

    if (status === 409 && json?.content?.data) {
      throw new BoardContentConflictError({
        data: normalizeBoardSnapshot(json.content.data),
        version: Number(json.content.version || 0),
      });
    }

    if (!json?.success) {
      throw new Error(json?.message || i18n.t("boards.saveError"));
    }
    return Number(json.version || 0);
  },
};

import { TBoardSnapshot } from "../types";

export type TBoardSyncMode = "solo" | "multiplayer";

export type TBoardLoadResult = {
  data: TBoardSnapshot;
  version: number;
};

export interface IBoardSyncAdapter {
  mode: TBoardSyncMode;
  load: (boardId: number) => Promise<TBoardLoadResult>;
  save: (
    boardId: number,
    data: TBoardSnapshot,
    clientVersion: number,
  ) => Promise<number>;
}

export class BoardContentConflictError extends Error {
  content: TBoardLoadResult;

  constructor(content: TBoardLoadResult) {
    super("Board content conflict");
    this.name = "BoardContentConflictError";
    this.content = content;
  }
}

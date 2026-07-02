import { TBoardSnapshot } from "../types";

export type TBoardSyncMode = "solo" | "multiplayer";

export type TBoardLoadResult = {
  data: TBoardSnapshot;
  version: number;
};

export type TBoardRealtimeCallbacks = {
  onScene?: (payload: { data: TBoardSnapshot; version: number; from?: string }) => void;
  onParticipants?: (participants: unknown[]) => void;
  onWaitingForHost?: () => void;
  onSessionStarted?: (sessionId: number) => void;
  onSessionClosed?: () => void;
  onJoined?: (payload: {
    role: "host" | "participant";
    scene: TBoardSnapshot;
    version: number;
  }) => void;
  onError?: (message: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onCursor?: (payload: {
    from: string;
    username?: string;
    pointer: {
      x: number;
      y: number;
      tool?: "pointer" | "laser";
    };
    button?: "up" | "down";
  }) => void;
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

export interface IBoardRealtimeAdapter {
  connect: (
    boardId: number,
    callbacks: TBoardRealtimeCallbacks,
  ) => Promise<void>;
  disconnect: () => void;
  sendScene: (boardId: number, data: TBoardSnapshot, version: number) => void;
  sendCursor: (payload: {
    x: number;
    y: number;
    tool: "pointer" | "laser";
    button: "up" | "down";
  }) => void;
  requestJoin: () => void;
  isConnected: () => boolean;
}

export class BoardContentConflictError extends Error {
  content: TBoardLoadResult;

  constructor(content: TBoardLoadResult) {
    super("Board content conflict");
    this.name = "BoardContentConflictError";
    this.content = content;
  }
}

"use client";

import { getBoardWsUrl } from "../api/boardWs";
import { BOARD_REALTIME_PING_MS } from "../constants";
import { normalizeBoardSnapshot } from "../utils/boardSnapshot";
import { TBoardSnapshot } from "../types";
import {
  IBoardRealtimeAdapter,
  TBoardRealtimeCallbacks,
} from "./types";

type TWsMessage = {
  type: string;
  data?: unknown;
  version?: number;
  from?: string;
  participants?: { id: string }[];
  session_id?: number;
  message?: string;
  pointer?: { x: number; y: number };
  username?: string;
  is_student?: boolean;
  button?: "up" | "down";
};

export class MultiplayerBoardSyncAdapter implements IBoardRealtimeAdapter {
  private ws: WebSocket | null = null;
  private callbacks: TBoardRealtimeCallbacks = {};
  private boardId: number | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  async connect(boardId: number, callbacks: TBoardRealtimeCallbacks) {
    this.disconnect();
    this.boardId = boardId;
    this.callbacks = callbacks;
    this.shouldReconnect = true;
    await this.openSocket();
  }

  private openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.boardId) {
        reject(new Error("boardId is required"));
        return;
      }

      const ws = new WebSocket(getBoardWsUrl(this.boardId));
      this.ws = ws;

      ws.onopen = () => {
        this.callbacks.onConnectionChange?.(true);
        this.startPing();
        resolve();
      };

      ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      ws.onerror = () => {
        this.callbacks.onError?.("WebSocket error");
      };

      ws.onclose = () => {
        this.stopPing();
        this.callbacks.onConnectionChange?.(false);
        if (this.shouldReconnect && this.boardId) {
          this.reconnectTimer = setTimeout(() => {
            void this.openSocket();
          }, 2000);
        }
      };
    });
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.sendRaw({ type: "ping" });
    }, BOARD_REALTIME_PING_MS);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private sendRaw(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private handleMessage(raw: string) {
    let message: TWsMessage;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }

    switch (message.type) {
      case "pong":
        return;
      case "session_started":
        if (message.session_id) {
          this.callbacks.onSessionStarted?.(Number(message.session_id));
        }
        this.requestJoin();
        return;
      case "session_closed":
        this.callbacks.onSessionClosed?.();
        return;
      case "joined":
        if (message.data || (message as { scene?: unknown }).scene) {
          const scene = normalizeBoardSnapshot(
            (message as { scene?: unknown }).scene ?? message.data,
          );
          this.callbacks.onJoined?.({
            role:
              (message as { role?: "host" | "participant" }).role ||
              "participant",
            scene,
            version: Number(message.version || 0),
          });
        }
        if (message.participants) {
          this.callbacks.onParticipants?.(message.participants);
        }
        return;
      case "scene":
        this.callbacks.onScene?.({
          data: normalizeBoardSnapshot(message.data),
          version: Number(message.version || 0),
          from: message.from,
        });
        return;
      case "cursor": {
        const from = message.from;
        if (!from) {
          return;
        }
        const pointer = message.pointer as
          | { x: number; y: number; tool?: "pointer" | "laser" }
          | undefined;
        if (!pointer || typeof pointer.x !== "number" || typeof pointer.y !== "number") {
          return;
        }
        this.callbacks.onCursor?.({
          from,
          username: message.username,
          isStudent: !!message.is_student,
          pointer,
          button: message.button,
        });
        return;
      }
      case "participants":
        if (message.participants) {
          this.callbacks.onParticipants?.(message.participants);
        }
        return;
      case "error":
        this.callbacks.onError?.(String(message.message || "Unknown error"));
        return;
      default:
        return;
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.boardId = null;
    this.callbacks = {};
  }

  sendScene(boardId: number, data: TBoardSnapshot, version: number) {
    if (!this.isConnected()) {
      return;
    }
    this.sendRaw({
      type: "scene",
      board_id: boardId,
      data,
      version,
    });
  }

  sendCursor(payload: {
    x: number;
    y: number;
    tool: "pointer" | "laser";
    button: "up" | "down";
  }) {
    this.sendRaw({
      type: "cursor",
      pointer: payload,
      button: payload.button,
    });
  }

  requestJoin() {
    this.sendRaw({ type: "join" });
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const multiplayerBoardSyncAdapter = new MultiplayerBoardSyncAdapter();

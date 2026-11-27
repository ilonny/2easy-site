"use client";

import { getBoardWsUrl } from "../api/boardWs";
import { BOARD_REALTIME_PING_MS } from "../constants";
import { normalizeBoardSnapshot } from "../utils/boardSnapshot";
import { stashAndStripSnapshot } from "../utils/boardFileStore";
import { TBoardParticipant, TBoardSnapshot } from "../types";
import type { TLessonTimerState } from "@/app/lessons/mediaSync/types";
import type { TChatAttachment, TChatMessage } from "@/components/Chat/types";
import {
  IBoardRealtimeAdapter,
  TBoardRealtimeCallbacks,
} from "./types";

type TWsMessage = {
  type: string;
  data?: unknown;
  version?: number;
  from?: string;
  participants?: Array<{
    id: string;
    isStudent?: boolean;
    is_student?: boolean;
    displayName?: string;
    display_name?: string;
    avatar?: string | null;
  }>;
  session_id?: number;
  message?: string;
  pointer?: { x: number; y: number };
  username?: string;
  is_student?: boolean;
  button?: "up" | "down";
};

const normalizeParticipants = (
  participants: TWsMessage["participants"],
): TBoardParticipant[] => {
  if (!participants?.length) {
    return [];
  }

  return participants.map((participant) => ({
    id: participant.id,
    isStudent: !!(participant.isStudent ?? participant.is_student),
    username:
      participant.displayName ||
      participant.display_name ||
      (participant.isStudent ?? participant.is_student ? "Ученик" : "Учитель"),
    avatar: participant.avatar || null,
  }));
};

export class MultiplayerBoardSyncAdapter implements IBoardRealtimeAdapter {
  private ws: WebSocket | null = null;
  private callbacks: TBoardRealtimeCallbacks = {};
  private boardId: number | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private timerListeners = new Set<(timer: TLessonTimerState) => void>();
  private pendingTimer: TLessonTimerState | null = null;
  private chatListeners = new Set<
    (
      event:
        | { type: "history"; messages: TChatMessage[] }
        | { type: "message"; message: TChatMessage },
    ) => void
  >();

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
        if (this.pendingTimer) {
          this.sendRaw({ type: "timer", timer: this.pendingTimer });
        }
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
          const scene = stashAndStripSnapshot(
            this.boardId || 0,
            normalizeBoardSnapshot(
              (message as { scene?: unknown }).scene ?? message.data,
            ),
          );
          this.callbacks.onJoined?.({
            role:
              (message as { role?: "host" | "participant" }).role ||
              "participant",
            scene,
            version: Number(message.version || 0),
            filesOmitted: !!(message as { files_omitted?: boolean }).files_omitted,
          });
        }
        if (message.participants) {
          this.callbacks.onParticipants?.(
            normalizeParticipants(message.participants),
          );
        }
        this.emitTimerMessage(message);
        this.emitChatHistory(message);
        return;
      case "chat":
        this.emitChatMessage(message);
        return;
      case "timer":
        this.emitTimerMessage(message);
        return;
      case "scene":
        this.callbacks.onScene?.({
          data: stashAndStripSnapshot(
            this.boardId || 0,
            normalizeBoardSnapshot(message.data),
          ),
          version: Number(message.version || 0),
          from: message.from,
          filesOmitted: !!(message as { files_omitted?: boolean }).files_omitted,
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
          this.callbacks.onParticipants?.(
            normalizeParticipants(message.participants),
          );
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

  sendTimer(timer: TLessonTimerState) {
    this.pendingTimer = timer;
    this.sendRaw({ type: "timer", timer });
  }

  sendChat(payload: {
    text: string;
    attachments?: TChatAttachment[];
    replyToId?: number | null;
  }) {
    this.sendRaw({
      type: "chat",
      text: payload.text,
      attachments: payload.attachments || [],
      reply_to_id: payload.replyToId || null,
    });
  }

  subscribeChat(
    listener: (
      event:
        | { type: "history"; messages: TChatMessage[] }
        | { type: "message"; message: TChatMessage },
    ) => void,
  ) {
    this.chatListeners.add(listener);
    return () => {
      this.chatListeners.delete(listener);
    };
  }

  subscribeTimer(listener: (timer: TLessonTimerState) => void) {
    this.timerListeners.add(listener);
    return () => {
      this.timerListeners.delete(listener);
    };
  }

  private emitChatHistory(message: TWsMessage) {
    const chat = (message as { chat?: TChatMessage[] }).chat;
    if (!Array.isArray(chat)) return;
    this.chatListeners.forEach((listener) =>
      listener({ type: "history", messages: chat }),
    );
  }

  private emitChatMessage(message: TWsMessage) {
    const entry = (message as { message?: TChatMessage }).message;
    if (!entry || typeof entry !== "object" || !entry.id) return;
    this.chatListeners.forEach((listener) =>
      listener({ type: "message", message: entry }),
    );
  }

  private emitTimerMessage(message: TWsMessage) {
    const timer = (message as { timer?: TLessonTimerState }).timer;
    if (!timer || typeof timer !== "object") return;
    if (typeof timer.status !== "string") return;
    this.timerListeners.forEach((listener) => listener(timer));
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const multiplayerBoardSyncAdapter = new MultiplayerBoardSyncAdapter();

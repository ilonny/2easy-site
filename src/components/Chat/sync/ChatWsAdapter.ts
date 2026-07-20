"use client";

import { getChatWsUrl } from "../api/chatWs";
import { CHAT_REALTIME_PING_MS, CHAT_RECONNECT_MS } from "../constants";
import type {
  TChatMessage,
  TChatReaction,
  TChatRealtimeCallbacks,
} from "../types";

type TWsIncoming = {
  type: string;
  message?: TChatMessage | string;
  messages?: TChatMessage[];
  message_id?: number;
  reactions?: TChatReaction[];
};

type TPendingSend = {
  message: string;
  replyToId?: number | null;
};

export class ChatWsAdapter {
  private ws: WebSocket | null = null;
  private callbacks: TChatRealtimeCallbacks = {};
  private lessonId: number | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private connectionGen = 0;
  private pendingSends: TPendingSend[] = [];

  async connect(lessonId: number, callbacks: TChatRealtimeCallbacks) {
    this.teardownSocket();
    this.lessonId = lessonId;
    this.callbacks = callbacks;
    this.shouldReconnect = true;
    this.connectionGen += 1;
    await this.openSocket(this.connectionGen);
  }

  private openSocket(gen: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.lessonId) {
        reject(new Error("lessonId is required"));
        return;
      }
      if (gen !== this.connectionGen) {
        resolve();
        return;
      }

      const ws = new WebSocket(getChatWsUrl(this.lessonId));
      this.ws = ws;

      ws.onopen = () => {
        if (gen !== this.connectionGen || this.ws !== ws) {
          ws.close();
          resolve();
          return;
        }
        this.callbacks.onConnectionChange?.(true);
        this.startPing();
        this.flushPendingSends();
        resolve();
      };

      ws.onmessage = (event) => {
        if (gen !== this.connectionGen || this.ws !== ws) return;
        this.handleMessage(String(event.data || ""));
      };

      ws.onerror = () => {
        if (gen !== this.connectionGen || this.ws !== ws) return;
        this.callbacks.onError?.("WebSocket error");
      };

      ws.onclose = () => {
        if (this.ws === ws) this.ws = null;
        this.stopPing();
        if (gen !== this.connectionGen) return;
        this.callbacks.onConnectionChange?.(false);
        if (this.shouldReconnect && this.lessonId) {
          this.reconnectTimer = setTimeout(() => {
            if (!this.shouldReconnect || gen !== this.connectionGen) return;
            void this.openSocket(this.connectionGen);
          }, CHAT_RECONNECT_MS);
        }
      };
    });
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.sendRaw({ type: "ping" });
    }, CHAT_REALTIME_PING_MS);
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
      return true;
    }
    return false;
  }

  private flushPendingSends() {
    if (!this.pendingSends.length) return;
    const queue = [...this.pendingSends];
    this.pendingSends = [];
    for (const item of queue) {
      const ok = this.sendRaw({
        type: "send",
        message: item.message,
        ...(item.replyToId ? { reply_to_id: item.replyToId } : {}),
      });
      if (!ok) {
        this.pendingSends.push(item);
        break;
      }
    }
  }

  private handleMessage(raw: string) {
    let payload: TWsIncoming;
    try {
      payload = JSON.parse(raw);
    } catch {
      return;
    }

    switch (payload.type) {
      case "pong":
        return;
      case "history":
        this.callbacks.onHistory?.(
          Array.isArray(payload.messages) ? payload.messages : [],
        );
        return;
      case "message":
        if (payload.message && typeof payload.message === "object") {
          this.callbacks.onMessage?.(payload.message);
        }
        return;
      case "edit":
        if (payload.message && typeof payload.message === "object") {
          this.callbacks.onEdit?.(payload.message);
        }
        return;
      case "reaction":
        if (
          payload.message_id != null &&
          Number(payload.message_id) > 0 &&
          Array.isArray(payload.reactions)
        ) {
          this.callbacks.onReaction?.(
            Number(payload.message_id),
            payload.reactions,
          );
        }
        return;
      case "error":
        this.callbacks.onError?.(
          typeof payload.message === "string"
            ? payload.message
            : "Unknown error",
        );
        return;
      default:
        return;
    }
  }

  sendMessage(message: string, replyToId?: number | null) {
    const payload = {
      type: "send",
      message,
      ...(replyToId ? { reply_to_id: replyToId } : {}),
    };
    if (this.sendRaw(payload)) return;

    this.pendingSends.push({ message, replyToId });
    if (this.ws?.readyState === WebSocket.CONNECTING) return;
    if (this.shouldReconnect && this.lessonId && !this.reconnectTimer) {
      this.connectionGen += 1;
      void this.openSocket(this.connectionGen);
    }
  }

  editMessage(id: number, message: string) {
    this.sendRaw({ type: "edit", id, message });
  }

  toggleReaction(messageId: number, emoji: string) {
    this.sendRaw({ type: "reaction", message_id: messageId, emoji });
  }

  private teardownSocket() {
    this.shouldReconnect = false;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const ws = this.ws;
    this.ws = null;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  }

  disconnect() {
    this.connectionGen += 1;
    this.pendingSends = [];
    this.teardownSocket();
    this.lessonId = null;
    this.callbacks = {};
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

"use client";

import { BASE_URL, fetchPostJson } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";
import { publishLessonMediaPlay } from "./publishLessonMediaPlay";
import {
  LESSON_MEDIA_CATCH_UP_MS,
  LESSON_MEDIA_WS_PATH,
  type TLessonMediaKind,
  type TLessonMediaPlayRequest,
} from "./types";

type TRole = "teacher" | "student";

type TIncoming = {
  type?: string;
  server_time_ms?: number;
  command_id?: number;
  ex_id?: number;
  kind?: string;
  media_index?: number;
  position_sec?: number;
  action?: string;
  scroll?: boolean;
};

const wsUrl = (lessonId: number) => {
  const token = getTokenFromLocalStorage();
  const wsBase = String(BASE_URL || "").replace(/^http/i, "ws");
  const params = new URLSearchParams({ lesson_id: String(lessonId) });
  if (token) params.set("token", token);
  return `${wsBase}${LESSON_MEDIA_WS_PATH}?${params.toString()}`;
};

class LessonMediaSyncClient {
  private ws: WebSocket | null = null;
  private lessonId = 0;
  private role: TRole | null = null;
  private shouldReconnect = false;
  private generation = 0;
  private ready = false;
  private clockOffsetMs = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(lessonId: number, role: TRole) {
    this.teardownSocket();
    this.lessonId = lessonId;
    this.role = role;
    this.shouldReconnect = true;
    this.generation += 1;
    this.open(this.generation);
  }

  disconnect() {
    this.shouldReconnect = false;
    this.role = null;
    this.teardownSocket();
  }

  isOpen() {
    return this.ready && this.ws?.readyState === WebSocket.OPEN;
  }

  private teardownSocket() {
    this.generation += 1;
    this.ready = false;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const ws = this.ws;
    this.ws = null;
    if (ws && ws.readyState < WebSocket.CLOSING) {
      ws.close();
    }
  }

  private open(gen: number) {
    if (!this.lessonId || gen !== this.generation) return;
    const ws = new WebSocket(wsUrl(this.lessonId));
    this.ws = ws;
    this.ready = false;

    ws.onopen = () => {
      if (gen !== this.generation || this.ws !== ws) {
        ws.close();
      }
    };

    ws.onmessage = (event) => {
      if (gen !== this.generation || this.ws !== ws) return;
      let msg: TIncoming | null = null;
      try {
        msg = JSON.parse(String(event.data)) as TIncoming;
      } catch {
        return;
      }
      if (!msg?.type) return;

      if ((msg.type === "hello" || msg.type === "pong") && msg.server_time_ms) {
        this.clockOffsetMs = Number(msg.server_time_ms) - Date.now();
      }

      if (msg.type === "hello") {
        this.ready = true;
        this.startPing(gen);
        return;
      }

      if (msg.type !== "play" || this.role !== "student") return;
      const kind: TLessonMediaKind | null =
        msg.kind === "video" ? "video" : msg.kind === "audio" ? "audio" : null;
      const serverTimeMs = Number(msg.server_time_ms || 0);
      const commandId = Number(msg.command_id || 0);
      const exId = Number(msg.ex_id || 0);
      if (!kind || !commandId || !exId || !serverTimeMs) return;
      if (Date.now() + this.clockOffsetMs - serverTimeMs > LESSON_MEDIA_CATCH_UP_MS) {
        return;
      }
      publishLessonMediaPlay({
        commandId,
        exId,
        kind,
        mediaIndex: Number(msg.media_index || 0),
        positionSec: Number(msg.position_sec || 0),
        serverTimeMs,
        clockOffsetMs: this.clockOffsetMs,
        action: msg.action === "pause" ? "pause" : "play",
        scroll: msg.scroll !== false,
      });
    };

    ws.onclose = () => {
      if (gen !== this.generation) return;
      this.ready = false;
      if (this.pingTimer) {
        clearInterval(this.pingTimer);
        this.pingTimer = null;
      }
      if (!this.shouldReconnect) return;
      this.reconnectTimer = setTimeout(() => this.open(gen), 1500);
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private startPing(gen: number) {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (gen !== this.generation || this.ws?.readyState !== WebSocket.OPEN) return;
      this.ws.send(JSON.stringify({ type: "ping" }));
    }, 20000);
  }
}

export const lessonMediaSyncClient = new LessonMediaSyncClient();

export const requestSyncedPlay = (getPayload: () => TLessonMediaPlayRequest) => {
  const payload = getPayload();
  void (async () => {
    try {
      const res = await fetchPostJson({
        path: "/lesson-focus",
        isSecure: true,
        data: {
          lesson_id: payload.lesson_id,
          ex_id: payload.ex_id,
          kind: payload.kind,
          media_index: payload.media_index,
          position_sec: payload.position_sec,
          action: payload.action,
          scroll: payload.scroll,
        },
      });
      const data = await res?.json();
      if (!data?.success) {
        toast(i18n.t("lessons.syncMedia.notConnected"), { type: "error" });
      }
    } catch {
      toast(i18n.t("lessons.syncMedia.notConnected"), { type: "error" });
    }
  })();
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatWsAdapter } from "../sync/ChatWsAdapter";
import type { TChatMessage } from "../types";

type TParams = {
  lessonId: number;
  enabled: boolean;
  studentIds?: number[];
};

export const useLessonChat = ({
  lessonId,
  enabled,
  studentIds = [],
}: TParams) => {
  const [messageList, setMessageList] = useState<TChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const studentIdsRef = useRef(studentIds);
  studentIdsRef.current = studentIds;
  const adapterRef = useRef<ChatWsAdapter | null>(null);

  useEffect(() => {
    if (!enabled || !lessonId) {
      adapterRef.current?.disconnect();
      adapterRef.current = null;
      setConnected(false);
      return;
    }

    let cancelled = false;
    const adapter = new ChatWsAdapter();
    adapterRef.current = adapter;

    void adapter.connect(lessonId, {
      onHistory: (messages) => {
        if (cancelled) return;
        setMessageList(messages);
      },
      onMessage: (message) => {
        if (cancelled) return;
        setMessageList((prev) => {
          if (
            Number.isFinite(message.id) &&
            message.id > 0 &&
            prev.some((m) => m.id === message.id)
          ) {
            return prev;
          }
          return [...prev, message];
        });
      },
      onEdit: (message) => {
        if (cancelled) return;
        setMessageList((prev) =>
          prev.map((m) => (m.id === message.id ? message : m)),
        );
      },
      onReaction: (messageId, reactions) => {
        if (cancelled) return;
        setMessageList((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
        );
      },
      onConnectionChange: (isConnected) => {
        if (cancelled) return;
        setConnected(isConnected);
      },
      onError: (errorMessage) => {
        console.error("[lesson-chat]", errorMessage);
      },
    });

    return () => {
      cancelled = true;
      adapter.disconnect();
      if (adapterRef.current === adapter) {
        adapterRef.current = null;
      }
    };
  }, [enabled, lessonId]);

  const sendMessage = useCallback(
    (text: string, replyToId?: number | null) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      adapterRef.current?.sendMessage(
        trimmed,
        studentIdsRef.current,
        replyToId || null,
      );
    },
    [],
  );

  const editMessage = useCallback((id: number, text: string) => {
    const trimmed = text.trim();
    if (!id || !trimmed) return;
    adapterRef.current?.editMessage(id, trimmed);
  }, []);

  const toggleReaction = useCallback((messageId: number, emoji: string) => {
    if (!messageId || !emoji) return;
    adapterRef.current?.toggleReaction(messageId, emoji);
  }, []);

  return {
    messageList,
    connected,
    sendMessage,
    editMessage,
    toggleReaction,
  };
};

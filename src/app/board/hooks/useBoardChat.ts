"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/auth";
import type { TChatAttachment, TChatMessage } from "@/components/Chat/types";
import { multiplayerBoardSyncAdapter } from "../sync/MultiplayerBoardSyncAdapter";

const selfParticipantId = (profile?: {
  id?: number | string | null;
  studentId?: number | string | null;
  isStudent?: boolean;
}) => {
  if (!profile) return "";
  if (profile.isStudent || profile.studentId) {
    return `student:${profile.studentId}`;
  }
  if (profile.id == null) return "";
  return `user:${profile.id}`;
};

const decorate = (
  raw: TChatMessage & { senderId?: string },
  selfId: string,
): TChatMessage => {
  const mine = !!raw.senderId && raw.senderId === selfId;
  return {
    ...raw,
    direction: mine ? "outgoing" : "incoming",
    is_mine: mine,
  };
};

/** Chat for a board that is not attached to a lesson. */
export function useBoardChat({
  boardId,
  enabled,
}: {
  boardId: number;
  enabled: boolean;
}) {
  const { profile } = useContext(AuthContext);
  const selfId = selfParticipantId(profile);
  const [messageList, setMessageList] = useState<TChatMessage[]>([]);

  useEffect(() => {
    if (!enabled || !boardId) {
      setMessageList([]);
      return;
    }
    return multiplayerBoardSyncAdapter.subscribeChat((event) => {
      if (event.type === "history") {
        setMessageList(event.messages.map((message) => decorate(message, selfId)));
        return;
      }
      const message = decorate(event.message, selfId);
      setMessageList((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });
    });
  }, [boardId, enabled, selfId]);

  const sendMessage = useCallback(
    (
      text: string,
      replyToId?: number | null,
      attachments?: TChatAttachment[],
    ) => {
      const trimmed = text.trim();
      if (!trimmed && !attachments?.length) return;
      if (!multiplayerBoardSyncAdapter.isConnected()) {
        const localId = -Date.now();
        setMessageList((prev) => [
          ...prev,
          {
            id: localId,
            message: trimmed,
            sender: profile?.name || "",
            senderId: selfId,
            direction: "outgoing",
            is_mine: true,
            created_at: new Date().toISOString(),
            attachments,
          },
        ]);
        return;
      }
      multiplayerBoardSyncAdapter.sendChat({
        text: trimmed,
        attachments,
        replyToId,
      });
    },
    [profile?.name, selfId],
  );

  const editMessage = useCallback((id: number, text: string) => {
    const trimmed = text.trim();
    if (!id || !trimmed) return;
    setMessageList((prev) =>
      prev.map((message) =>
        message.id === id
          ? { ...message, message: trimmed, edited_at: new Date().toISOString() }
          : message,
      ),
    );
  }, []);

  const toggleReaction = useCallback((messageId: number, emoji: string) => {
    if (!messageId || !emoji) return;
    setMessageList((prev) =>
      prev.map((message) => {
        if (message.id !== messageId) return message;
        const reactions = message.reactions ? [...message.reactions] : [];
        const existing = reactions.find((item) => item.emoji === emoji);
        if (existing?.reacted_by_me) {
          return {
            ...message,
            reactions: reactions
              .map((item) =>
                item.emoji === emoji
                  ? { ...item, count: Math.max(0, item.count - 1), reacted_by_me: false }
                  : item,
              )
              .filter((item) => item.count > 0),
          };
        }
        if (existing) {
          return {
            ...message,
            reactions: reactions.map((item) =>
              item.emoji === emoji
                ? { ...item, count: item.count + 1, reacted_by_me: true }
                : item,
            ),
          };
        }
        return {
          ...message,
          reactions: [...reactions, { emoji, count: 1, reacted_by_me: true }],
        };
      }),
    );
  }, []);

  return { messageList, sendMessage, editMessage, toggleReaction };
}

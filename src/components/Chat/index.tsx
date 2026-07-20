"use client";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import { ClipboardEvent, FC, useCallback, useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import ChatIcon from "@/assets/icons/chat.svg";
import CloseIcon from "@/assets/icons/close.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { ChatComposerOverlay } from "./ChatComposerOverlay";
import { ChatMessageItem } from "./ChatMessageItem";
import { useLessonChat } from "./hooks/useLessonChat";
import type { TChatMessage } from "./types";
import styles from "./styles.module.css";

type TProps = {
  lesson_id: number;
  /** @deprecated unused — kept for call-site compatibility */
  students?: unknown;
  /** @deprecated unused — kept for call-site compatibility */
  isTeacher?: boolean;
};

export const Chat: FC<TProps> = ({ lesson_id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<TChatMessage | null>(null);
  const [editing, setEditing] = useState<TChatMessage | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { messageList, sendMessage, editMessage, toggleReaction } =
    useLessonChat({
      lessonId: lesson_id,
      enabled: isOpen,
    });

  const bumpInput = useCallback(() => setInputKey((k) => k + 1), []);

  const clearComposerMode = useCallback(() => {
    setReplyTo(null);
    setEditing(null);
    setDraft("");
    bumpInput();
  }, [bumpInput]);

  const handleSend = useCallback(
    (_html: string, messageText: string) => {
      const text = (messageText || _html || draft || "").trim();
      if (!text) return;

      if (editing) {
        editMessage(editing.id, text);
      } else {
        sendMessage(text, replyTo?.id || null);
      }
      clearComposerMode();
    },
    [clearComposerMode, draft, editMessage, editing, replyTo?.id, sendMessage],
  );

  const handlePaste = useCallback((evt: ClipboardEvent) => {
    evt.preventDefault();
    const text = evt.clipboardData.getData("text/plain").trim();
    if (!text) return;
    document.execCommand("insertText", false, text);
  }, []);

  const startReply = useCallback(
    (message: TChatMessage) => {
      setEditing(null);
      setDraft("");
      setReplyTo(message);
      bumpInput();
    },
    [bumpInput],
  );

  const startEdit = useCallback(
    (message: TChatMessage) => {
      setReplyTo(null);
      setEditing(message);
      setDraft(message.message);
      bumpInput();
    },
    [bumpInput],
  );

  useEffect(() => {
    if (!replyTo && !editing) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(
        ".cs-message-input__content-editor",
      ) as HTMLElement | null;
      el?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [replyTo, editing, inputKey]);

  if (!isOpen) {
    return (
      <Button
        endContent={<Image src={ChatIcon} alt="ChatIcon" />}
        color="primary"
        variant="light"
        onClick={() => setIsOpen(true)}
        size="lg"
        style={{ minWidth: 300 }}
      >
        <T k="lessons.lessonChat" />
      </Button>
    );
  }

  const placeholder = editing
    ? i18n.t("lessons.chatEditing")
    : replyTo
      ? `${i18n.t("lessons.chatReplyingTo")} ${replyTo.sender}`
      : i18n.t("lessons.typeMessage");

  return (
    <div className={styles.chatRoot}>
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Content />
            <ConversationHeader.Actions>
              <Button
                endContent={<Image src={CloseIcon} alt="ChatIcon" />}
                color="primary"
                variant="light"
                onClick={() => {
                  setIsOpen(false);
                  clearComposerMode();
                }}
              >
                <T k="common.close" />
              </Button>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList>
            {messageList.map((m) => (
              <ChatMessageItem
                key={m.id}
                message={m}
                isReplyTarget={replyTo?.id === m.id}
                onReply={startReply}
                onEdit={startEdit}
                onToggleReaction={toggleReaction}
              />
            ))}
          </MessageList>
          <MessageInput
            key={inputKey}
            placeholder={placeholder}
            attachButton={false}
            value={draft}
            onChange={(_html, textContent) => setDraft(textContent || "")}
            onSend={handleSend}
            onPaste={handlePaste}
          />
        </ChatContainer>
      </MainContainer>

      <ChatComposerOverlay
        replyTo={replyTo}
        editing={editing}
        onCancelReply={() => {
          setReplyTo(null);
          bumpInput();
        }}
        onCancelEdit={clearComposerMode}
      />
    </div>
  );
};

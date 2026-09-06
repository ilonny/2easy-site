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
import { createPortal } from "react-dom";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import CloseIcon from "@/assets/icons/close.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { LessonToolTrigger } from "@/app/lessons/components/LessonToolTrigger";
import { ChatComposerOverlay } from "./ChatComposerOverlay";
import { ChatMessageItem } from "./ChatMessageItem";
import { useLessonChat } from "./hooks/useLessonChat";
import type { TChatMessage } from "./types";
import styles from "./styles.module.css";

type TProps = {
  lesson_id: number;
  /** Active student thread — required for teachers with multiple students. */
  studentId?: number;
  lessonSessionId?: number;
  isTeacher?: boolean;
};

const ChatFabIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Chat: FC<TProps> = ({
  lesson_id,
  studentId,
  lessonSessionId,
  isTeacher = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<TChatMessage | null>(null);
  const [editing, setEditing] = useState<TChatMessage | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  // iOS: после открытия клавиатуры иногда остаётся горизонтальный скролл.
  // На время работы чата на мобайле жёстко отключаем overflow-x.
  useEffect(() => {
    if (isDesktop || !isOpen) return;
    const prevBodyOverflowX = document.body.style.overflowX;
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = prevBodyOverflowX;
      document.documentElement.style.overflowX = prevHtmlOverflowX;
    };
  }, [isDesktop, isOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { messageList, sendMessage, editMessage, toggleReaction } =
    useLessonChat({
      lessonId: lesson_id,
      studentId,
      sessionId: lessonSessionId,
      enabled: isOpen && !!(studentId || lessonSessionId),
    });

  const bumpInput = useCallback(() => setInputKey((k) => k + 1), []);

  const clearComposerMode = useCallback(() => {
    setReplyTo(null);
    setEditing(null);
    setDraft("");
    bumpInput();
  }, [bumpInput]);

  const handleOpen = useCallback(() => {
    if (isTeacher && !studentId && !lessonSessionId) {
      toast(i18n.t("lessons.selectStudentForChat"), { type: "warning" });
      return;
    }
    if (!studentId && !lessonSessionId) {
      toast(i18n.t("lessons.selectStudentForChat"), { type: "warning" });
      return;
    }
    setIsOpen(true);
  }, [isTeacher, lessonSessionId, studentId]);

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

  useEffect(() => {
    if (!isOpen || !isTeacher) return;
    if (!studentId && !lessonSessionId) {
      setIsOpen(false);
      clearComposerMode();
    }
  }, [
    clearComposerMode,
    isOpen,
    isTeacher,
    lessonSessionId,
    studentId,
  ]);

  if (!isOpen) {
    const label = i18n.t("lessons.lessonChat");
    return (
      <LessonToolTrigger
        label={<T k="lessons.lessonChat" />}
        ariaLabel={label}
        icon={<ChatFabIcon />}
        onClick={handleOpen}
      />
    );
  }

  const placeholder = editing
    ? i18n.t("lessons.chatEditing")
    : replyTo
      ? `${i18n.t("lessons.chatReplyingTo")} ${replyTo.sender}`
      : i18n.t("lessons.typeMessage");

  const panel = (
    <div
      className={
        isDesktop
          ? styles.chatRootDesktop
          : `${styles.chatRoot} ${styles.chatRootFixed}`
      }
    >
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Content />
            <ConversationHeader.Actions>
              <Button
                endContent={<Image src={CloseIcon} alt="ChatIcon" />}
                color="primary"
                variant="light"
                className={isDesktop ? undefined : "touch-manipulation"}
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

  // Desktop: in-flow in the tools stack. Mobile: portal above fixed header.
  if (isDesktop || typeof document === "undefined") {
    return panel;
  }

  return createPortal(panel, document.body);
};

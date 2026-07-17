"use client";

import {
  ClipboardEvent,
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@nextui-org/react";
import ChatIcon from "@/assets/icons/chat.svg";
import CloseIcon from "@/assets/icons/close.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useLessonChat } from "./hooks/useLessonChat";
import { ChatMessageItem } from "./ChatMessageItem";
import type { TChatMessage, TChatStudent } from "./types";
import styles from "./styles.module.css";

type TProps = {
  lesson_id: number;
  students?: TChatStudent[];
  isTeacher: boolean;
};

export const Chat: FC<TProps> = ({ lesson_id, students, isTeacher }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<TChatMessage | null>(null);
  const [editing, setEditing] = useState<TChatMessage | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const studentIds =
    students
      ?.map((s) => Number(s?.student_id))
      .filter((id) => Number.isFinite(id) && id > 0) || [];

  const { messageList, sendMessage, editMessage, toggleReaction } =
    useLessonChat({
      lessonId: lesson_id,
      enabled: isOpen,
      studentIds: isTeacher ? studentIds : [],
    });

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messageList.length, isOpen]);

  const clearComposerMode = useCallback(() => {
    setReplyTo(null);
    setEditing(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    if (editing) {
      editMessage(editing.id, text);
    } else {
      sendMessage(text, replyTo?.id || null);
    }
    setDraft("");
    clearComposerMode();
  }, [clearComposerMode, draft, editMessage, editing, replyTo?.id, sendMessage]);

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent<HTMLTextAreaElement>) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handlePaste = useCallback((evt: ClipboardEvent<HTMLTextAreaElement>) => {
    evt.preventDefault();
    const text = evt.clipboardData.getData("text/plain").trim();
    if (!text) return;
    document.execCommand("insertText", false, text);
  }, []);

  const startReply = useCallback((message: TChatMessage) => {
    setEditing(null);
    setReplyTo(message);
  }, []);

  const startEdit = useCallback((message: TChatMessage) => {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.message);
  }, []);

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

  return (
    <div style={{ position: "relative", height: "500px", minWidth: 300 }}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            <T k="lessons.lessonChat" />
          </span>
          <Button
            endContent={<Image src={CloseIcon} alt="Close" />}
            color="primary"
            variant="light"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              clearComposerMode();
              setDraft("");
            }}
          >
            <T k="common.close" />
          </Button>
        </div>

        <div className={styles.messages} ref={listRef}>
          {messageList.map((m) => (
            <ChatMessageItem
              key={m.id}
              message={m}
              onReply={startReply}
              onEdit={startEdit}
              onToggleReaction={toggleReaction}
            />
          ))}
        </div>

        <div className={styles.composerBar}>
          {replyTo ? (
            <div className={styles.replyPreview}>
              <div className={styles.previewMeta}>
                <span className={styles.previewLabel}>
                  <T k="lessons.chatReplyingTo" /> {replyTo.sender}
                </span>
                <span className={styles.previewText}>{replyTo.message}</span>
              </div>
              <button
                type="button"
                className={styles.cancelPreview}
                onClick={() => setReplyTo(null)}
                aria-label="cancel reply"
              >
                ×
              </button>
            </div>
          ) : null}

          {editing ? (
            <div className={styles.editPreview}>
              <div className={styles.previewMeta}>
                <span className={styles.previewLabel}>
                  <T k="lessons.chatEditing" />
                </span>
                <span className={styles.previewText}>{editing.message}</span>
              </div>
              <button
                type="button"
                className={styles.cancelPreview}
                onClick={() => {
                  setEditing(null);
                  setDraft("");
                }}
                aria-label="cancel edit"
              >
                ×
              </button>
            </div>
          ) : null}

          <div className={styles.inputRow}>
            <textarea
              className={styles.textarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={i18n.t("lessons.typeMessage")}
              rows={2}
            />
            <button
              type="button"
              className={styles.sendBtn}
              disabled={!draft.trim()}
              onClick={handleSubmit}
            >
              {editing ? (
                <T k="lessons.chatSave" />
              ) : (
                <T k="lessons.chatSend" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

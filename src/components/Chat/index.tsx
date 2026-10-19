"use client";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import {
  ChangeEvent,
  ClipboardEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import CloseIcon from "@/assets/icons/close.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { LessonToolTrigger } from "@/app/lessons/components/LessonToolTrigger";
import { uploadChatFiles } from "./api/uploadChatFiles";
import { ChatComposerOverlay } from "./ChatComposerOverlay";
import { ChatMessageItem } from "./ChatMessageItem";
import {
  CHAT_ATTACHMENT_ACCEPT,
  CHAT_ATTACHMENT_MAX_BYTES,
  CHAT_ATTACHMENT_MAX_COUNT,
} from "./constants";
import { useLessonChat } from "./hooks/useLessonChat";
import type { TChatMessage, TChatPendingAttachment } from "./types";
import { chatAttachmentKindFromMime } from "./utils/attachmentKind";
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
  const [pendingAttachments, setPendingAttachments] = useState<
    TChatPendingAttachment[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    return () => {
      pendingAttachments.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

  const { messageList, sendMessage, editMessage, toggleReaction } =
    useLessonChat({
      lessonId: lesson_id,
      studentId,
      sessionId: lessonSessionId,
      enabled: isOpen && !!(studentId || lessonSessionId || isTeacher),
    });

  const bumpInput = useCallback(() => setInputKey((k) => k + 1), []);

  const clearPendingAttachments = useCallback(() => {
    setPendingAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const clearComposerMode = useCallback(() => {
    setReplyTo(null);
    setEditing(null);
    setDraft("");
    clearPendingAttachments();
    bumpInput();
  }, [bumpInput, clearPendingAttachments]);

  const handleOpen = useCallback(() => {
    if (!isTeacher && !studentId && !lessonSessionId) {
      toast(i18n.t("lessons.selectStudentForChat"), { type: "warning" });
      return;
    }
    setIsOpen(true);
  }, [isTeacher, lessonSessionId, studentId]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    setPendingAttachments((prev) => {
      const next = [...prev];
      for (const file of list) {
        if (next.length >= CHAT_ATTACHMENT_MAX_COUNT) {
          toast(i18n.t("lessons.chatAttachMaxCount"), { type: "warning" });
          break;
        }
        if (file.size > CHAT_ATTACHMENT_MAX_BYTES) {
          toast(i18n.t("lessons.chatAttachTooLarge"), { type: "error" });
          continue;
        }
        const kind = chatAttachmentKindFromMime(file.type, file.name);
        if (
          kind === "file" &&
          !file.type.startsWith("image/") &&
          !file.type.startsWith("audio/") &&
          !file.type.startsWith("video/") &&
          file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")
        ) {
          toast(i18n.t("lessons.chatAttachInvalidType"), { type: "error" });
          continue;
        }
        next.push({
          localId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          kind:
            kind === "file" && file.name.toLowerCase().endsWith(".pdf")
              ? "pdf"
              : kind,
        });
      }
      return next;
    });
  }, []);

  const handleAttachClick = useCallback(() => {
    if (editing) {
      toast(i18n.t("lessons.chatAttachWhileEditing"), { type: "info" });
      return;
    }
    fileInputRef.current?.click();
  }, [editing]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files?.length) addFiles(files);
      event.target.value = "";
    },
    [addFiles],
  );

  const handleSend = useCallback(
    async (_html: string, messageText: string) => {
      // chatscope requires non-empty input to fire onSend; we may use ZWSP for file-only
      const text = (messageText || _html || draft || "")
        .replace(/\u200b/g, "")
        .trim();
      if (editing) {
        if (!text) return;
        editMessage(editing.id, text);
        clearComposerMode();
        return;
      }

      if (!text && !pendingAttachments.length) return;
      if (uploading) return;

      let uploaded = undefined as Awaited<ReturnType<typeof uploadChatFiles>>;
      if (pendingAttachments.length) {
        setUploading(true);
        try {
          uploaded = await uploadChatFiles(
            pendingAttachments.map((item) => item.file),
          );
          if (!uploaded.length) {
            toast(i18n.t("lessons.chatAttachUploadFailed"), { type: "error" });
            return;
          }
        } catch (error) {
          console.error("[lesson-chat] upload", error);
          toast(i18n.t("lessons.chatAttachUploadFailed"), { type: "error" });
          return;
        } finally {
          setUploading(false);
        }
      }

      sendMessage(text, replyTo?.id || null, uploaded);
      clearComposerMode();
    },
    [
      clearComposerMode,
      draft,
      editMessage,
      editing,
      pendingAttachments,
      replyTo?.id,
      sendMessage,
      uploading,
    ],
  );

  const handlePaste = useCallback(
    (evt: ClipboardEvent) => {
      const files = Array.from(evt.clipboardData?.files || []);
      if (files.length && !editing) {
        evt.preventDefault();
        addFiles(files);
        return;
      }
      evt.preventDefault();
      const text = evt.clipboardData.getData("text/plain").trim();
      if (!text) return;
      document.execCommand("insertText", false, text);
    },
    [addFiles, editing],
  );

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
      clearPendingAttachments();
      setEditing(message);
      setDraft(message.message);
      bumpInput();
    },
    [bumpInput, clearPendingAttachments],
  );

  useEffect(() => {
    if (!replyTo && !editing && !pendingAttachments.length) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(
        ".cs-message-input__content-editor",
      ) as HTMLElement | null;
      el?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [replyTo, editing, inputKey, pendingAttachments.length]);

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

  const canSend =
    !uploading &&
    (editing
      ? !!draft.trim()
      : !!draft.trim() || pendingAttachments.length > 0);

  // chatscope MessageInput only fires onSend when value.length > 0
  const inputValue =
    draft ||
    (!editing && pendingAttachments.length > 0 ? "\u200b" : "");

  const panel = (
    <div
      className={
        isDesktop
          ? styles.chatRootDesktop
          : `${styles.chatRoot} ${styles.chatRootFixed}`
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={CHAT_ATTACHMENT_ACCEPT}
        multiple
        className={styles.hiddenFileInput}
        onChange={handleFileChange}
      />
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
            attachButton
            sendDisabled={!canSend}
            disabled={uploading}
            value={inputValue}
            onChange={(_html, textContent) =>
              setDraft((textContent || "").replace(/\u200b/g, ""))
            }
            onSend={handleSend}
            onPaste={handlePaste}
            onAttachClick={handleAttachClick}
          />
        </ChatContainer>
      </MainContainer>

      <ChatComposerOverlay
        replyTo={replyTo}
        editing={editing}
        pendingAttachments={pendingAttachments}
        uploading={uploading}
        onCancelReply={() => {
          setReplyTo(null);
          bumpInput();
        }}
        onCancelEdit={clearComposerMode}
        onRemoveAttachment={(localId) => {
          setPendingAttachments((prev) => {
            const target = prev.find((item) => item.localId === localId);
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((item) => item.localId !== localId);
          });
        }}
      />
    </div>
  );

  // Desktop: in-flow in the tools stack. Mobile: portal above fixed header.
  if (isDesktop || typeof document === "undefined") {
    return panel;
  }

  return createPortal(panel, document.body);
};

"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, Spinner, Textarea } from "@nextui-org/react";
import { AuthContext } from "@/auth";
import { useTranslation } from "react-i18next";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";
import {
  openSupportWs,
  supportAssetUrl,
  supportCloseConversation,
  supportGetCurrent,
  supportGetMessages,
  supportMarkRead,
  supportSendMessage,
  supportStartNewConversation,
  supportUploadFiles,
  type TSupportConversation,
  type TSupportMessage,
} from "./api";
import { getSupportUserId } from "./access";

function shouldHideOnPath(pathname: string | null) {
  return (
    !!pathname?.includes("/lessons/") ||
    !!pathname?.includes("/grammar/") ||
    !!pathname?.includes("/board/")
  );
}

const senderLabel = (
  sender: TSupportMessage["sender"],
  t: (k: string) => string,
) => {
  if (sender === "user") return t("supportChat.you");
  if (sender === "admin") return t("supportChat.operator");
  if (sender === "system") return t("supportChat.system");
  return t("supportChat.assistant");
};

export const SupportChatWidget = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile, isAuthorized } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [startingNew, setStartingNew] = useState(false);
  const [conversation, setConversation] = useState<TSupportConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<TSupportMessage[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [typing, setTyping] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const conversationIdRef = useRef<number | null>(null);
  const openRef = useRef(false);
  const supportUserId = getSupportUserId(profile);
  const supportUserIdRef = useRef<number | null>(supportUserId);

  const resetChatState = useCallback(() => {
    setOpen(false);
    setConversation(null);
    setMessages([]);
    setText("");
    setUnread(0);
    setTyping(null);
    setPendingFiles([]);
    setLoading(false);
    setSending(false);
    conversationIdRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  // Logout / switch account — never keep previous user's thread in memory.
  useEffect(() => {
    const prev = supportUserIdRef.current;
    supportUserIdRef.current = supportUserId;
    if (!isAuthorized || supportUserId == null) {
      resetChatState();
      return;
    }
    if (prev != null && prev !== supportUserId) {
      resetChatState();
    }
  }, [isAuthorized, supportUserId, resetChatState]);

  const visible = useMemo(() => {
    if (!isAuthorized) return false;
    if (profile?.isStudent || profile?.studentId) return false;
    if (!supportUserId) return false;
    if (shouldHideOnPath(pathname)) return false;
    return true;
  }, [isAuthorized, profile, pathname, supportUserId]);

  const isClosed = conversation?.status === "closed";

  const statusLabel = useMemo(() => {
    if (!conversation) return "";
    if (conversation.status === "human") return t("supportChat.statusHuman");
    if (conversation.status === "waiting_human")
      return t("supportChat.statusWaiting");
    if (conversation.status === "closed") return t("supportChat.statusClosed");
    return t("supportChat.statusAi");
  }, [conversation, t]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  const mergeMessages = useCallback((incoming: TSupportMessage[]) => {
    setMessages((prev) => {
      const map = new Map<number, TSupportMessage>();
      [...prev, ...incoming].forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).sort((a, b) => a.id - b.id);
    });
  }, []);

  const subscribeWs = useCallback((conversationId: number) => {
    conversationIdRef.current = conversationId;
    const send = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "subscribe",
            conversationId,
          }),
        );
        return true;
      }
      return false;
    };
    if (send()) return;
    // WS may still be connecting — retry briefly
    window.setTimeout(() => send(), 300);
    window.setTimeout(() => send(), 1000);
  }, []);

  const refreshMessages = useCallback(async (conversationId: number) => {
    try {
      const msgRes = await supportGetMessages({
        conversationId,
        limit: 80,
      });
      if (msgRes.messages) {
        setMessages(msgRes.messages);
        scrollToBottom();
      }
    } catch {
      // ignore
    }
  }, []);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    try {
      let res = await supportGetCurrent();
      // First create can race/500 on prod; one retry usually finds the open chat.
      if (!res?.conversation || res.success === false) {
        await new Promise((r) => setTimeout(r, 400));
        res = await supportGetCurrent();
      }
      if (!res?.conversation) return;
      if (
        supportUserIdRef.current != null &&
        Number(res.conversation.user_id) !== supportUserIdRef.current
      ) {
        return;
      }
      setConversation(res.conversation);
      conversationIdRef.current = res.conversation.id;
      setUnread(Number(res.unread || 0));
      const msgRes = await supportGetMessages({
        conversationId: res.conversation.id,
        limit: 80,
      });
      setMessages(msgRes.messages || []);
      scrollToBottom();
      subscribeWs(res.conversation.id);
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 400));
        const res = await supportGetCurrent();
        if (!res?.conversation) return;
        if (
          supportUserIdRef.current != null &&
          Number(res.conversation.user_id) !== supportUserIdRef.current
        ) {
          return;
        }
        setConversation(res.conversation);
        conversationIdRef.current = res.conversation.id;
        setUnread(Number(res.unread || 0));
        const msgRes = await supportGetMessages({
          conversationId: res.conversation.id,
          limit: 80,
        });
        setMessages(msgRes.messages || []);
        scrollToBottom();
        subscribeWs(res.conversation.id);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, [subscribeWs]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    conversationIdRef.current = conversation?.id ?? null;
    if (conversation?.id) subscribeWs(conversation.id);
  }, [conversation?.id, subscribeWs]);

  useEffect(() => {
    if (!visible) {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    let pingTimer: number | undefined;
    let reconnectTimer: number | undefined;
    let disposed = false;

    const clearPing = () => {
      if (pingTimer) {
        window.clearInterval(pingTimer);
        pingTimer = undefined;
      }
    };

    const connect = () => {
      if (disposed) return;
      clearPing();
      const ws = openSupportWs({
        onEvent: (data) => {
          if (data?.type === "message" && data.message) {
            const msgCid = Number(
              data.message.conversation_id ?? data.conversationId ?? 0,
            );
            const cid = conversationIdRef.current;
            if (cid && msgCid && msgCid !== cid) return;
            mergeMessages([data.message]);
            scrollToBottom();
            if (!openRef.current && data.message.sender !== "user") {
              setUnread((u) => u + 1);
            }
          }
          if (data?.type === "status" && data.status) {
            const cid = conversationIdRef.current;
            if (
              data.conversationId &&
              cid &&
              Number(data.conversationId) !== cid
            ) {
              return;
            }
            setConversation((c) =>
              c ? { ...c, status: data.status } : c,
            );
            // Safety net: takeover / return-AI can race WS subscribe — refetch.
            if (cid) void refreshMessages(cid);
          }
          if (data?.type === "typing") {
            setTyping(
              data.isTyping
                ? data.who === "admin"
                  ? t("supportChat.typingOperator")
                  : t("supportChat.typingAssistant")
                : null,
            );
          }
          if (data?.type === "unread") {
            setUnread(Number(data.unread || 0));
          }
          if (data?.type === "ready") {
            const cid = conversationIdRef.current;
            if (cid) subscribeWs(cid);
          }
        },
        onClose: () => {
          clearPing();
          if (disposed) return;
          // Reconnect while widget stays visible (operator takeover often arrives mid-session).
          reconnectTimer = window.setTimeout(() => {
            if (!disposed) connect();
          }, 1500);
        },
      });
      wsRef.current = ws;
      pingTimer = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25000);
    };

    connect();
    return () => {
      disposed = true;
      clearPing();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [visible, supportUserId, mergeMessages, t, subscribeWs, refreshMessages]);

  useEffect(() => {
    if (open && visible && !conversation) {
      void loadConversation();
    }
  }, [open, visible, conversation, loadConversation]);

  useEffect(() => {
    if (open && conversation?.id && !isClosed) {
      void supportMarkRead(conversation.id);
      setUnread(0);
    }
  }, [open, conversation?.id, messages.length, isClosed]);

  const onSend = async () => {
    if (!conversation || sending || isClosed) return;
    const content = text.trim();
    const filesToSend = pendingFiles;
    if (!content && !filesToSend.length) return;
    setSending(true);
    setText("");
    setPendingFiles([]);
    try {
      let attachments;
      if (filesToSend.length) {
        const up = await supportUploadFiles(filesToSend);
        if (!up.success) throw new Error(up.message || "upload failed");
        attachments = up.attachments;
      }
      const res = await supportSendMessage({
        conversationId: conversation.id,
        content: content || undefined,
        attachments,
      });
      if (res.userMessage) mergeMessages([res.userMessage]);
      if (res.assistantMessage) mergeMessages([res.assistantMessage]);
      scrollToBottom();
    } catch {
      // Restore draft if send failed so the user doesn't lose the text
      setText((prev) => prev || content);
      if (filesToSend.length) setPendingFiles(filesToSend);
    } finally {
      setSending(false);
    }
  };

  const onEndDialog = async () => {
    if (!conversation || ending || isClosed) return;
    if (!window.confirm(t("supportChat.endDialogConfirm"))) return;
    setEnding(true);
    try {
      const res = await supportCloseConversation(conversation.id);
      if (res.conversation) setConversation(res.conversation);
      if (res.systemMessage && res.systemMessage.id) {
        mergeMessages([res.systemMessage]);
      }
      setPendingFiles([]);
      setText("");
      scrollToBottom();
    } catch {
      // ignore
    } finally {
      setEnding(false);
    }
  };

  const onNewDialog = async () => {
    if (startingNew) return;
    setStartingNew(true);
    try {
      const res = await supportStartNewConversation();
      if (!res?.conversation) return;
      setConversation(res.conversation);
      setMessages(res.messages || []);
      setUnread(Number(res.unread || 0));
      setPendingFiles([]);
      setText("");
      subscribeWs(res.conversation.id);
      scrollToBottom();
    } catch {
      // ignore
    } finally {
      setStartingNew(false);
    }
  };

  if (!visible) return null;

  const showWelcomeEmpty = !loading && messages.length === 0;

  return (
    <div className={`fixed bottom-5 right-5 ${OVERLAY_ABOVE_HEADER_Z_CLASS}`}>
      {open ? (
        <div className="mb-3 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-xl">
          <div className="flex items-start justify-between gap-2 border-b border-black/5 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-brand-black">
                {t("supportChat.title")}
              </div>
              <div className="text-xs text-brand-grayFont">{statusLabel}</div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {conversation && !isClosed ? (
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-xs text-brand-grayFont hover:bg-brand-gray"
                  onClick={() => void onEndDialog()}
                  disabled={ending}
                >
                  {ending ? "…" : t("supportChat.endDialog")}
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-brand-grayFont hover:bg-brand-gray"
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {loading && (
              <div className="flex justify-center py-8">
                <Spinner size="sm" color="primary" />
              </div>
            )}

            {showWelcomeEmpty ? (
              <div className="rounded-[16px] bg-brand-gray px-4 py-3 text-sm text-brand-black">
                <div className="mb-1 font-medium">
                  {t("supportChat.welcomeTitle")}
                </div>
                <div className="whitespace-pre-wrap text-brand-grayFont">
                  {t("supportChat.welcomeBody")}
                </div>
              </div>
            ) : null}

            {!loading &&
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="mb-0.5 text-[11px] text-brand-grayFont">
                    {senderLabel(m.sender, t)}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-[14px] px-3 py-2 text-sm ${
                      m.sender === "user"
                        ? "bg-brand-violet text-white"
                        : m.sender === "system"
                          ? "bg-brand-gray text-brand-grayFont"
                          : "bg-brand-gray text-brand-black"
                    }`}
                  >
                    {m.content ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : null}
                    {m.attachments?.map((att, idx) => (
                      <div key={`${m.id}-a-${idx}`} className="mt-2">
                        {att.kind === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={supportAssetUrl(att.path)}
                            alt={att.name || "image"}
                            className="max-h-40 rounded-lg"
                          />
                        ) : (
                          <a
                            href={supportAssetUrl(att.path)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {att.name || t("supportChat.file")}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {typing ? (
              <div className="text-xs text-brand-grayFont">{typing}</div>
            ) : null}
          </div>

          {isClosed ? (
            <div className="border-t border-black/5 p-3">
              <p className="mb-3 text-xs text-brand-grayFont">
                {t("supportChat.closedHint")}
              </p>
              <Button
                className={`${brandPrimaryBtnClassName} w-full`}
                isLoading={startingNew}
                onPress={() => void onNewDialog()}
              >
                {t("supportChat.newDialog")}
              </Button>
            </div>
          ) : (
            <>
              {pendingFiles.length > 0 ? (
                <div className="border-t border-black/5 px-4 py-2 text-xs text-brand-grayFont">
                  {pendingFiles.map((f) => f.name).join(", ")}
                </div>
              ) : null}

              <div className="border-t border-black/5 p-3">
                <div className="flex items-end gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files?.length) return;
                      setPendingFiles(Array.from(files));
                      e.target.value = "";
                    }}
                  />
                  <Button
                    isIconOnly
                    variant="flat"
                    className="rounded-[14px]"
                    onPress={() => fileRef.current?.click()}
                    aria-label={t("supportChat.attach")}
                  >
                    📎
                  </Button>
                  <Textarea
                    minRows={1}
                    maxRows={4}
                    value={text}
                    onValueChange={setText}
                    placeholder={t("supportChat.placeholder")}
                    className="min-w-0 flex-1"
                    classNames={{
                      base: "min-w-0 flex-1",
                      inputWrapper:
                        "rounded-[14px] bg-brand-gray shadow-none border-none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void onSend();
                      }
                    }}
                  />
                  <Button
                    isIconOnly
                    className={`${brandPrimaryBtnClassName} min-w-10 shrink-0`}
                    isLoading={sending}
                    onPress={() => void onSend()}
                    aria-label={t("supportChat.send")}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M3.4 20.4 21 12 3.4 3.6 3 10.2l11.4 1.8L3 13.8l.4 6.6Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-violet text-white shadow-lg hover:opacity-90"
        aria-label={t("supportChat.title")}
      >
        <span className="text-xl">💬</span>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-medium">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
    </div>
  );
};

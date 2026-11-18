import { fetchGet, fetchPostJson, getApiUrl, getBaseUrl } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";

export type TSupportAttachment = {
  id?: number;
  path: string;
  name?: string;
  mime?: string;
  size?: number;
  kind?: "image" | "file" | "audio" | "video";
};

export type TSupportMessage = {
  id: number;
  conversation_id: number;
  sender: "user" | "assistant" | "admin" | "system";
  content: string | null;
  attachments: TSupportAttachment[] | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
};

export type TSupportConversation = {
  id: number;
  user_id: number;
  login: string;
  user_name: string | null;
  status: "ai" | "waiting_human" | "human" | "closed";
  last_message_at?: string | null;
};

const asJson = async <T>(res: Response): Promise<T> => {
  return (await res.json()) as T;
};

export const supportGetCurrent = async () => {
  const res = await fetchGet({
    path: "/support/conversations/current",
    isSecure: true,
  });
  return asJson<{
    success: boolean;
    conversation: TSupportConversation;
    unread: number;
    message?: string;
  }>(res);
};

export const supportGetMessages = async (params: {
  conversationId: number;
  before?: number;
  limit?: number;
}) => {
  const q = new URLSearchParams({
    conversationId: String(params.conversationId),
  });
  if (params.before) q.set("before", String(params.before));
  if (params.limit) q.set("limit", String(params.limit));
  const res = await fetchGet({
    path: `/support/messages?${q.toString()}`,
    isSecure: true,
  });
  return asJson<{ success: boolean; messages: TSupportMessage[] }>(res);
};

export const supportSendMessage = async (params: {
  conversationId: number;
  content?: string;
  attachments?: TSupportAttachment[];
}) => {
  const res = await fetchPostJson({
    path: "/support/messages",
    isSecure: true,
    data: params,
  });
  return asJson<{
    success: boolean;
    userMessage: TSupportMessage;
    assistantMessage?: TSupportMessage;
    message?: string;
  }>(res);
};

export const supportMarkRead = async (conversationId: number) => {
  const res = await fetchPostJson({
    path: "/support/conversations/read",
    isSecure: true,
    data: { conversationId },
  });
  return asJson<{ success: boolean }>(res);
};

export const supportCloseConversation = async (conversationId: number) => {
  const res = await fetchPostJson({
    path: "/support/conversations/close",
    isSecure: true,
    data: { conversationId },
  });
  return asJson<{
    success: boolean;
    conversation: TSupportConversation;
    systemMessage?: TSupportMessage;
    message?: string;
  }>(res);
};

export const supportStartNewConversation = async () => {
  const res = await fetchPostJson({
    path: "/support/conversations/new",
    isSecure: true,
    data: {},
  });
  return asJson<{
    success: boolean;
    conversation: TSupportConversation;
    messages: TSupportMessage[];
    unread: number;
    message?: string;
  }>(res);
};

export const supportUploadFiles = async (files: FileList | File[]) => {
  const token = getTokenFromLocalStorage();
  const form = new FormData();
  const list = Array.from(files);
  list.forEach((f) => form.append("file", f));
  const res = await fetch(`${getApiUrl()}/support/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
    body: form,
  });
  return res.json() as Promise<{
    success: boolean;
    attachments?: TSupportAttachment[];
    message?: string;
  }>;
};

export const supportAssetUrl = (path: string) => {
  const clean = path.replace(/^\/+/, "");
  return `${getBaseUrl()}/${clean}`;
};

export const openSupportWs = (handlers: {
  onEvent: (data: any) => void;
  onClose?: () => void;
}) => {
  const token = getTokenFromLocalStorage();
  const base = getBaseUrl().replace(/^http/, "ws");
  const ws = new WebSocket(
    `${base}/api/support/ws?token=${encodeURIComponent(token || "")}`,
  );
  ws.onmessage = (ev) => {
    try {
      handlers.onEvent(JSON.parse(String(ev.data)));
    } catch {
      // ignore
    }
  };
  ws.onclose = () => handlers.onClose?.();
  return ws;
};

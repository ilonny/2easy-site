export type TChatReply = {
  id: number;
  message: string;
  sender: string;
  sender_avatar?: string | null;
};

export type TChatReaction = {
  emoji: string;
  count: number;
  reacted_by_me: boolean;
};

export type TChatAttachment = {
  id?: number;
  path: string;
  name: string;
  mime: string;
  size?: number;
  kind: "image" | "audio" | "video" | "pdf" | "file";
};

export type TChatPendingAttachment = {
  localId: string;
  file: File;
  previewUrl: string;
  name: string;
  mime: string;
  size: number;
  kind: TChatAttachment["kind"];
};

export type TChatMessage = {
  id: number;
  message: string;
  sender: string;
  sender_avatar?: string | null;
  direction: "incoming" | "outgoing";
  is_mine?: boolean;
  position?: "normal" | "single" | "first" | "last";
  created_at?: string | null;
  edited_at?: string | null;
  reply_to?: TChatReply | null;
  reactions?: TChatReaction[];
  attachments?: TChatAttachment[];
};

export type TChatRealtimeCallbacks = {
  onHistory?: (messages: TChatMessage[]) => void;
  onMessage?: (message: TChatMessage) => void;
  onEdit?: (message: TChatMessage) => void;
  onReaction?: (messageId: number, reactions: TChatReaction[]) => void;
  onError?: (message: string) => void;
  onConnectionChange?: (connected: boolean) => void;
};

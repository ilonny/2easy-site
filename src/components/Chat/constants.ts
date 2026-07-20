export const CHAT_WS_PATH = "/api/chat/ws";
export const CHAT_REALTIME_PING_MS = 25000;
export const CHAT_RECONNECT_MS = 2000;

export const CHAT_ALLOWED_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
] as const;

export type TChatAllowedEmoji = (typeof CHAT_ALLOWED_EMOJIS)[number];

export const normalizeChatEmoji = (emoji: string) =>
  String(emoji || "")
    .normalize("NFC")
    .replace(/\uFE0F/g, "")
    .trim();

export const canonicalizeChatEmoji = (
  emoji: string,
): TChatAllowedEmoji | null => {
  const normalized = normalizeChatEmoji(emoji);
  if (!normalized) return null;
  return (
    CHAT_ALLOWED_EMOJIS.find(
      (item) => normalizeChatEmoji(item) === normalized,
    ) || null
  );
};

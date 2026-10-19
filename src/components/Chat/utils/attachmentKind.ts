import type { TChatAttachment } from "../types";

export const chatAttachmentKindFromMime = (
  mime: string,
  fileName = "",
): TChatAttachment["kind"] => {
  const normalized = String(mime || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("audio/")) return "audio";
  if (normalized.startsWith("video/")) return "video";
  if (
    normalized === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  ) {
    return "pdf";
  }
  return "file";
};

export const formatChatFileSize = (bytes?: number) => {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

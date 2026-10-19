import { checkResponse, fetchPostMultipart } from "@/api";
import type { TChatAttachment } from "../types";

export const uploadChatFiles = async (
  files: File[],
): Promise<TChatAttachment[]> => {
  if (!files.length) return [];

  const fd = new FormData();
  for (const file of files) {
    fd.append("file", file);
  }

  const res = await fetchPostMultipart({
    path: "/chat/upload",
    data: fd,
    isSecure: true,
  });
  const json = await res.json();
  checkResponse(json);

  const attachments = Array.isArray(json?.attachments) ? json.attachments : [];
  return attachments.filter(
    (item: TChatAttachment) => item && typeof item.path === "string",
  );
};

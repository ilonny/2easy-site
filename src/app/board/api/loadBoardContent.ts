import { fetchGet } from "@/api";
import { normalizeBoardSnapshot } from "../utils/boardSnapshot";

export const loadBoardContent = async (boardId: number) => {
  const res = await fetchGet({
    path: `/board?id=${boardId}`,
    isSecure: true,
  });
  const json = await res?.json();
  if (!json?.success || !json?.content) {
    return null;
  }

  return {
    data: normalizeBoardSnapshot(json.content.data),
    version: Number(json.content.version || 0),
  };
};

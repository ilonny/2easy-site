import { fetchPostJson } from "@/api";
import i18n from "@/i18n/config";

export const startBoardSession = async (boardId: number) => {
  const res = await fetchPostJson({
    path: "/board/session/create",
    isSecure: true,
    data: { board_id: boardId },
  });
  const json = await res?.json();
  if (!json?.success) {
    throw new Error(json?.message || i18n.t("boards.sessionCreateError"));
  }
  return json;
};

export const closeBoardSession = async (boardId: number) => {
  const res = await fetchPostJson({
    path: "/board/session/close",
    isSecure: true,
    data: { board_id: boardId },
  });
  const json = await res?.json();
  if (!json?.success) {
    throw new Error(json?.message || i18n.t("boards.sessionCloseError"));
  }
  return json;
};

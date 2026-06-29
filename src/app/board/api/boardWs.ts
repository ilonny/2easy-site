import { BASE_URL } from "@/api";
import { BOARD_WS_PATH } from "@/app/board/constants";
import { getTokenFromLocalStorage } from "@/auth/utils";

export const getBoardWsUrl = (boardId: number) => {
  const token = getTokenFromLocalStorage();
  const wsBase = BASE_URL.replace(/^http/i, "ws");
  const params = new URLSearchParams({
    board_id: String(boardId),
  });
  if (token) {
    params.set("token", token);
  }
  return `${wsBase}${BOARD_WS_PATH}?${params.toString()}`;
};

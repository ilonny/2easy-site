import { BASE_URL } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { CHAT_WS_PATH } from "../constants";

export const getChatWsUrl = (lessonId: number) => {
  const token = getTokenFromLocalStorage();
  const wsBase = BASE_URL.replace(/^http/i, "ws");
  const params = new URLSearchParams({
    lesson_id: String(lessonId),
  });
  if (token) params.set("token", token);
  return `${wsBase}${CHAT_WS_PATH}?${params.toString()}`;
};

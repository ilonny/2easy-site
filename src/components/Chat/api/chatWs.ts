import { BASE_URL } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { CHAT_WS_PATH } from "../constants";

export const getChatWsUrl = (
  lessonId: number,
  studentId?: number,
  sessionId?: number,
) => {
  const token = getTokenFromLocalStorage();
  const wsBase = String(BASE_URL || "").replace(/^http/i, "ws");
  const params = new URLSearchParams({
    lesson_id: String(lessonId),
  });
  if (studentId) params.set("student_id", String(studentId));
  if (sessionId) params.set("session_id", String(sessionId));
  if (token) params.set("token", token);
  return `${wsBase}${CHAT_WS_PATH}?${params.toString()}`;
};

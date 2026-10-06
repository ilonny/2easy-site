import { fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";

/** Open homework in the selected student's session, not the last session on that lesson. */
export async function openHomeworkForStudent(
  router: { push: (href: string) => void },
  homeworkLessonId: number,
  studentId: number,
) {
  const hwId = Number(homeworkLessonId);
  const sid = Number(studentId);
  if (!hwId || !sid) {
    return;
  }

  writeToLocalStorage("start_lesson_selected_ids", JSON.stringify([sid]));

  let sessionId = 0;
  try {
    const res = await fetchPostJson({
      path: "/lesson/session/start",
      isSecure: true,
      data: {
        lesson_id: hwId,
        student_ids: [sid],
      },
    });
    const json = await res?.json();
    sessionId = Number(json?.session?.id || 0);
  } catch {
    sessionId = 0;
  }

  const qs = new URLSearchParams();
  qs.set("student_id", String(sid));
  if (sessionId > 0) {
    qs.set("session_id", String(sessionId));
  }
  router.push(`/lessons/${hwId}?${qs.toString()}`);
}

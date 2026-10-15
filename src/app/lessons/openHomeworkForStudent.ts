import { fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";

/** Open lesson mode in a fresh session for the given students, not the last session on that lesson. */
export async function openLessonForStudents(
  router: { push: (href: string) => void },
  lessonId: number,
  studentIds: number[],
) {
  const id = Number(lessonId);
  const sids = studentIds.map(Number).filter((sid) => sid > 0);
  if (!id) {
    return;
  }
  if (!sids.length) {
    router.push(`/lessons/${id}`);
    return;
  }

  writeToLocalStorage("start_lesson_selected_ids", JSON.stringify(sids));

  let sessionId = 0;
  try {
    const res = await fetchPostJson({
      path: "/lesson/session/start",
      isSecure: true,
      data: {
        lesson_id: id,
        student_ids: sids,
      },
    });
    const json = await res?.json();
    sessionId = Number(json?.session?.id || 0);
  } catch {
    sessionId = 0;
  }

  const qs = new URLSearchParams();
  if (sids.length === 1) {
    qs.set("student_id", String(sids[0]));
  }
  if (sessionId > 0) {
    qs.set("session_id", String(sessionId));
  }
  const query = qs.toString();
  router.push(`/lessons/${id}${query ? `?${query}` : ""}`);
}

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
  await openLessonForStudents(router, hwId, [sid]);
}

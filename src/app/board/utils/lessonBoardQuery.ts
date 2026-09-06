export const buildLessonBoardQuery = (
  lessonId: number,
  studentId?: number,
  sessionId?: number,
) => {
  const query = new URLSearchParams({
    lesson_id: String(lessonId),
  });
  if (studentId) {
    query.set("student_id", String(studentId));
  }
  if (sessionId) {
    query.set("session_id", String(sessionId));
  }
  return query.toString();
};

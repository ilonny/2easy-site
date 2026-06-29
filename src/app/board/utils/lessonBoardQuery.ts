export const buildLessonBoardQuery = (
  lessonId: number,
  studentId?: number,
) => {
  const query = new URLSearchParams({
    lesson_id: String(lessonId),
  });
  if (studentId) {
    query.set("student_id", String(studentId));
  }
  return query.toString();
};

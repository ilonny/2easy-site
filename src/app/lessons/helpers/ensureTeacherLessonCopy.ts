import { checkResponse, fetchGet, fetchPostJson } from "@/api";

/** Catalog 2easy lessons are owned by user_id = 1. */
export const is2easyCatalogLesson = (lesson?: {
  user_id?: number;
  created_from_2easy?: number | boolean | null;
} | null) =>
  Boolean(
    lesson &&
      (Number(lesson.user_id) === 1 || Boolean(lesson.created_from_2easy)),
  );

/**
 * For catalog 2easy lessons, reuse an existing teacher copy or create one.
 * Returns the lesson id the teacher should attach/start on.
 */
export const ensureTeacherLessonCopy = async (
  sourceLessonId: number,
  teacherUserId: number,
): Promise<number> => {
  if (!sourceLessonId || !teacherUserId) {
    return sourceLessonId;
  }

  try {
    const listRes = await fetchGet({
      path: "/lessons",
      isSecure: true,
    });
    const listJson = await listRes.json();
    const lessons = Array.isArray(listJson?.lessons) ? listJson.lessons : [];
    const existing = lessons.find(
      (item: { id?: number; user_id?: number; created_from_id?: number }) =>
        Number(item.created_from_id) === sourceLessonId &&
        Number(item.user_id) === teacherUserId,
    );
    const existingId = Number(existing?.id || 0);
    if (existingId > 0) {
      return existingId;
    }
  } catch {
    /* fall through to copy */
  }

  const copyRes = await fetchPostJson({
    path: "/lessons/copy",
    isSecure: true,
    data: { lesson_id: sourceLessonId },
  });
  const copyJson = await copyRes.json();
  checkResponse(copyJson);
  const copiedId = Number(copyJson?.id || 0);
  return copiedId > 0 ? copiedId : sourceLessonId;
};

export const relationAttached = (res?: {
  success?: boolean;
  message?: string;
} | null) => {
  if (!res) return false;
  if (res.success !== false) return true;
  const message = String(res.message || "");
  return /уже прикреплен|already attach/i.test(message);
};

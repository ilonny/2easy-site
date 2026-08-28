import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useMemo, useRef, useState } from "react";
import { TLesson } from "../types";
import { parseRouteId } from "@/utils/parseRouteId";

export const useLessons = (
  studentId?: string,
  searchString?: string,
  isAuth: boolean = true,
  includeCourseLessons?: boolean,
) => {
  const [lessons, setLessons] = useState<TLesson[]>([]);
  const [lesson, setLesson] = useState<TLesson | undefined>();
  const [lessonsListIslLoading, setLessonsListIslLoading] = useState(false);
  const [courseLessons, setCourseLessons] = useState<TLesson[]>([]);
  const lessonsRequestIdRef = useRef(0);

  const getMainPageLessons = useCallback(async () => {
    setLessonsListIslLoading(true);
    try {
      const res = await fetchGet({
        path: "/main-page-lessons",
      });
      const data = await res?.json();
      if (data?.success === false) {
        return data;
      }
      if (data) {
        setLessons(data?.lessons || []);
      }
      return data;
    } finally {
      setLessonsListIslLoading(false);
    }
  }, []);

  const getLessons = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++lessonsRequestIdRef.current;
    setLessonsListIslLoading(true);
    try {
      let res;
      if (isAuth === false) {
        res = await fetchGet({
          path: "/main-page-lessons?disable_limit=1",
          signal,
        });
      } else {
        const params = new URLSearchParams();
        if (studentId) params.set("student_id", studentId);
        if (includeCourseLessons) params.set("include_course_lessons", "1");
        res = await fetchGet({
          path: params.toString() ? `/lessons?${params.toString()}` : "/lessons",
          isSecure: true,
          signal,
        });
      }
      if (signal?.aborted || requestId !== lessonsRequestIdRef.current) {
        return;
      }
      const data = await res?.json();
      if (signal?.aborted || requestId !== lessonsRequestIdRef.current) {
        return;
      }
      // Failed responses still have a body — don't wipe a good list with [].
      if (data?.success === false) {
        return data;
      }
      if (data) {
        setLessons(data?.lessons || []);
      }
      return data;
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") {
        return;
      }
      throw error;
    } finally {
      if (!signal?.aborted && requestId === lessonsRequestIdRef.current) {
        setLessonsListIslLoading(false);
      }
    }
  }, [isAuth, studentId, includeCourseLessons]);

  const getLesson = useCallback(
    async (id: string, studentIdParam?: number) => {
      const lessonId = parseRouteId(id);
      if (!lessonId) {
        setLesson(undefined);
        return {
          success: false,
          message: "Некорректный идентификатор урока",
        };
      }

      setLessonsListIslLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("id", lessonId);
        if (studentIdParam) params.set("student_id", String(studentIdParam));
        const res = await fetchGet({
          path: `/lesson?${params.toString()}`,
          isSecure: true,
        });
        const data = await res?.json();
        setLesson(data?.lesson);
        checkResponse(data, false, Boolean(studentIdParam));
        return data;
      } finally {
        setLessonsListIslLoading(false);
      }
    },
    [],
  );

  const changeLessonStatus = useCallback(
    async (
      relation_id?: number,
      status?: string,
      lesson_id?: number,
      student_id?: number,
    ) => {
      setLessonsListIslLoading(true);
      let data: any = null;
      if (!relation_id && lesson_id && student_id && status) {
        const createRes = await fetchPostJson({
          path: `/lesson-relation/create`,
          data: {
            lesson_id,
            student_id,
            status,
          },
          isSecure: true,
        });
        data = await createRes?.json();
        if (data?.success) {
          data.successMessage = "Статус успешно обновлен";
        }
      } else {
        const res = await fetchPostJson({
          path: `/lesson-relation/edit`,
          data: {
            relation_id,
            status,
          },
          isSecure: true,
        });
        data = await res?.json();
      }
      setLesson(data?.lesson);
      setLessonsListIslLoading(false);
      checkResponse(data);
      getLessons();
      return data;
    },
    [getLessons],
  );

  const deleteLessonRelation = useCallback(
    async (relation_id?: number) => {
      setLessonsListIslLoading(true);
      const res = await fetchPostJson({
        path: `/lesson-relation/delete`,
        data: {
          relation_id,
        },
        isSecure: true,
      });
      const data = await res?.json();
      setLesson(data?.lesson);
      setLessonsListIslLoading(false);
      checkResponse(data);
      getLessons();
      return data;
    },
    [getLessons],
  );

  const changeCourseStatus = useCallback(
    async (
      relation_id?: number,
      status?: string,
      course_id?: number,
      student_id?: number,
    ) => {
      setLessonsListIslLoading(true);
      let data: any = null;
      if (!relation_id && course_id && student_id && status) {
        const createRes = await fetchPostJson({
          path: `/course-relation/create`,
          data: {
            lesson_id: course_id,
            student_id,
            status,
          },
          isSecure: true,
        });
        data = await createRes?.json();
        if (data?.success) {
          data.successMessage = "Статус успешно обновлен";
        }
      } else {
        const res = await fetchPostJson({
          path: `/course-relation/edit`,
          data: {
            relation_id,
            status,
          },
          isSecure: true,
        });
        data = await res?.json();
      }
      setLesson(data?.lesson);
      setLessonsListIslLoading(false);
      checkResponse(data);
      getLessons();
      return data;
    },
    [getLessons],
  );

  const deleteCourseRelation = useCallback(
    async (relation_id?: number) => {
      setLessonsListIslLoading(true);
      const res = await fetchPostJson({
        path: `/course-relation/delete`,
        data: {
          relation_id,
        },
        isSecure: true,
      });
      const data = await res?.json();
      setLesson(data?.lesson);
      setLessonsListIslLoading(false);
      checkResponse(data);
      getLessons();
      return data;
    },
    [getLessons],
  );

  const filteredLessons = useMemo(() => {
    if (!searchString) {
      return lessons;
    }
    return lessons.filter((les) =>
      les?.title?.toLowerCase()?.includes(searchString?.toLowerCase()),
    );
  }, [searchString, lessons]);

  const getCourseLessons = useCallback(
    async (course_id: number, student_id?: number | string | null) => {
      setCourseLessons([]);
      const studentQuery =
        student_id !== undefined && student_id !== null && student_id !== ""
          ? `&student_id=${student_id}`
          : "";
      const res = await fetchGet({
        path: `/lessons/course?course_id=${course_id}${studentQuery}`,
        isSecure: true,
      });
      const data = await res?.json();
      setCourseLessons(data?.lessons || []);
      checkResponse(data);
      return data;
    },
    [],
  );

  return {
    lessons: filteredLessons,
    getLessons,
    lessonsListIslLoading,
    getLesson,
    lesson,
    changeLessonStatus,
    deleteLessonRelation,
    getMainPageLessons,
    setLesson,
    courseLessons,
    getCourseLessons,
    changeCourseStatus,
    deleteCourseRelation,
  };
};

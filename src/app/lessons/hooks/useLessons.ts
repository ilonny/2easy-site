import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useMemo, useState } from "react";
import { TLesson } from "../types";

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

  const getMainPageLessons = useCallback(async () => {
    setLessonsListIslLoading(true);
    const res = await fetchGet({
      path: "/main-page-lessons",
    });
    const data = await res?.json();
    if (data) {
      setLessons(data?.lessons || []);
    }
    setLessonsListIslLoading(false);
    return data;
  }, []);

  const getLessons = useCallback(async () => {
    setLessonsListIslLoading(true);
    let res;
    if (isAuth === false) {
      res = await fetchGet({
        path: "/main-page-lessons?disable_limit=1",
      });
    } else {
      const params = new URLSearchParams();
      if (studentId) params.set("student_id", studentId);
      if (includeCourseLessons) params.set("include_course_lessons", "1");
      res = await fetchGet({
        path: params.toString() ? `/lessons?${params.toString()}` : "/lessons",
        isSecure: true,
      });
    }
    const data = await res?.json();
    if (data) {
      setLessons(data?.lessons || []);
    }
    setLessonsListIslLoading(false);
    return data;
  }, [isAuth, studentId, includeCourseLessons]);

  const getLesson = useCallback(
    async (id: string, studentIdParam?: number) => {
      setLessonsListIslLoading(true);
      const url = studentIdParam
        ? `/lesson?id=${id}&student_id=${studentIdParam}`
        : `/lesson?id=${id}`;
      const res = await fetchGet({
        path: url,
        isSecure: true,
      });
      const data = await res?.json();
      setLesson(data?.lesson);
      setLessonsListIslLoading(false);
      checkResponse(data);
      return data;
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
    async (course_id: number, student_id: any) => {
      const res = await fetchGet({
        path: `/lessons/course?course_id=${course_id}&student_id=${student_id}`,
        isSecure: true,
      });
      const data = await res?.json();
      setCourseLessons(data?.lessons);
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

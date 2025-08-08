import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TLesson } from "../types";

export const useLessons = (
  studentId?: string,
  searchString?: string,
  isAuth?: boolean = true
) => {
  const [lessons, setLessons] = useState<TLesson[]>([]);
  const [lesson, setLesson] = useState<TLesson | undefined>();
  const [lessonsListIslLoading, setLessonsListIslLoading] = useState(false);

  const getMainPageLessons = useCallback(async () => {
    setLessonsListIslLoading(true);
    const res = await fetchGet({
      path: "/main-page-lessons",
    });
    const data = await res?.json();
    if (data) {
      setLessons(data?.lessons?.reverse() || []);
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
      res = await fetchGet({
        path: studentId ? `/lessons?student_id=${studentId}` : "/lessons",
        isSecure: true,
      });
    }
    const data = await res?.json();
    if (data) {
      setLessons(data?.lessons?.reverse() || []);
    }
    setLessonsListIslLoading(false);
    return data;
  }, [isAuth, studentId]);

  const getLesson = useCallback(async (id: string) => {
    setLessonsListIslLoading(true);
    const res = await fetchGet({
      path: `/lesson?id=${id}`,
      isSecure: true,
    });
    const data = await res?.json();
    setLesson(data?.lesson);
    setLessonsListIslLoading(false);
    checkResponse(data);
    return data;
  }, []);

  const changeLessonStatus = useCallback(
    async (relation_id?: number, status?: string) => {
      setLessonsListIslLoading(true);
      const res = await fetchPostJson({
        path: `/lesson-relation/edit`,
        data: {
          relation_id,
          status,
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
    [getLessons]
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
    [getLessons]
  );

  // useEffect(() => {
  //   getLessons();
  // }, [getLessons]);

  const filteredLessons = useMemo(() => {
    if (!searchString) {
      return lessons;
    }
    return lessons.filter((les) =>
      les?.title?.toLowerCase()?.includes(searchString?.toLowerCase())
    );
  }, [searchString, lessons]);

  return {
    lessons: filteredLessons,
    getLessons,
    lessonsListIslLoading,
    getLesson,
    lesson,
    changeLessonStatus,
    deleteLessonRelation,
    getMainPageLessons,
  };
};

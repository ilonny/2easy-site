import { fetchGet } from "@/api";
import { useCallback, useEffect, useState } from "react";
import { TLesson } from "../types";

export const useLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState<TLesson | undefined>();
  const [lessonsListIslLoading, setLessonsListIslLoading] = useState(false);

  const getLessons = useCallback(async () => {
    setLessonsListIslLoading(true);
    const res = await fetchGet({
      path: "/lessons",
      isSecure: true,
    });
    const data = await res?.json();
    if (data) {
      setLessons(data?.lessons || []);
    }
    setLessonsListIslLoading(false);
    return data;
  }, []);

  const getLesson = useCallback(async (id: string) => {
    setLessonsListIslLoading(true);
    const res = await fetchGet({
      path: `/lesson?id=${id}`,
      isSecure: true,
    });
    const data = await res?.json();
    setLesson(data?.lesson);
    setLessonsListIslLoading(true);
    return data;
  }, []);

  useEffect(() => {
    getLessons();
  }, [getLessons]);

  return { lessons, getLessons, lessonsListIslLoading, getLesson, lesson };
};

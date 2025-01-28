import { fetchGet } from "@/api";
import { useCallback, useEffect, useState } from "react";

export const useLessons = () => {
  const [lessons, setLessons] = useState([]);
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

  useEffect(() => {
    getLessons();
  }, [getLessons]);

  return { lessons, getLessons, lessonsListIslLoading };
};

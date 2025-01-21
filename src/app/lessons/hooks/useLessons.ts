import { fetchGet } from "@/api";
import { useCallback, useEffect, useState } from "react";

export const useLessons = () => {
  const [lessons, setLessons] = useState([]);

  const getLessons = useCallback(async () => {
    const res = await fetchGet({
      path: "/lessons",
      isSecure: true,
    });
    const data = await res?.json();
    if (data) {
      setLessons(data);
    }
  }, []);

  useEffect(() => {
    getLessons();
  }, [getLessons]);

  return { lessons };
};

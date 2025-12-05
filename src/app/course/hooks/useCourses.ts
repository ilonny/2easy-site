import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";

export type TCourse = {
  id: number;
  title: string;
  description: string;
  student_id?: string;
  group_id?: string;
  tags?: string;
  image_id?: string;
  image_path?: string;
  user_id: number;
  ["lesson_relations.status"]?: "open" | "close" | "complete";
  ["lesson_relations.id"]?: number;
  canEdit?: boolean;
  created_from_id?: number;
  created_from_2easy?: number;
  is_free?: string;
  is_my_lesson?: boolean;
  lesson_ids?: number[];
};

export const useCourses = () => {
  const [coursesIsLoading, setCoursesIsLoading] = useState(false);
  const [courses, setCourses] = useState<TCourse[]>([]);

  const getCourses = useCallback(async () => {
    setCoursesIsLoading(true);

    const res = await fetchGet({
      path: "/course/list",
      isSecure: true,
    });

    const data = await res?.json();
    if (data) {
      setCourses(
        data?.courses.map((course) => {
          return {
            ...course,
            lesson_ids: course?.lesson_ids ? JSON.parse(course.lesson_ids) : [],
          };
        }) || []
      );
    }
    setCoursesIsLoading(false);
    return data;
  }, []);

  return { coursesIsLoading, courses, getCourses };
};

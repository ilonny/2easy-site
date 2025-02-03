import { fetchGet, fetchPostJson } from "@/api";
import { useCallback, useState } from "react";

export const useStudentList = () => {
  const [students, setStudents] = useState([]);

  const getStudents = useCallback(async () => {
    const res = await fetchGet({
      path: "/student",
      isSecure: true,
    });
    const students = await res?.json();
    setStudents(students);
  }, []);

  const deleteStudent = useCallback(async (id) => {
    const res = await fetchPostJson({
      path: "/student/delete",
      isSecure: true,
      data: { id },
    });
    
    return await res?.json();
  }, []);

  return { students, getStudents, deleteStudent };
};

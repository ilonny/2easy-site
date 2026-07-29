import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { useCallback, useState } from "react";

export const useStudentList = (localStudents?: Array<any>) => {
  const [students, setStudents] = useState([]);

  const getStudents = useCallback(async () => {
    if (!!localStudents) {
      setStudents(localStudents);
      return;
    }
    if (!getTokenFromLocalStorage()) {
      setStudents([]);
      return;
    }
    const res = await fetchGet({
      path: "/student",
      isSecure: true,
    });
    const data = await res?.json();
    // API returns an array on success; on 401 it returns an object
    setStudents(Array.isArray(data) ? data : []);
  }, [localStudents]);

  const deleteStudent = useCallback(async (id) => {
    const res = await fetchPostJson({
      path: "/student/delete",
      isSecure: true,
      data: { id },
    });
    const student = await res?.json();
    checkResponse(student);
    return student;
  }, []);

  return { students, getStudents, deleteStudent };
};

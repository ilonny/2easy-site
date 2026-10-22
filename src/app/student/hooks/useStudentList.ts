import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { useCallback, useState } from "react";

type UseStudentListOptions = {
  /** When true, load archived students (`GET /student?archived=1`). */
  archived?: boolean;
};

export const useStudentList = (
  localStudents?: Array<any>,
  options?: UseStudentListOptions,
) => {
  const [students, setStudents] = useState([]);
  const archived = Boolean(options?.archived);

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
      path: archived ? "/student?archived=1" : "/student",
      isSecure: true,
      workspaceScope: "personal",
    });
    const data = await res?.json();
    // API returns an array on success; on 401 it returns an object.
    // Backend lists all students assigned to the teacher (pre-school compatible).
    setStudents(Array.isArray(data) ? data : []);
  }, [localStudents, archived]);

  const deleteStudent = useCallback(async (id) => {
    const res = await fetchPostJson({
      path: "/student/delete",
      isSecure: true,
      data: { id },
      workspaceScope: "personal",
    });
    const student = await res?.json();
    checkResponse(student);
    return student;
  }, []);

  const setStudentArchived = useCallback(
    async (id: number, is_archived: boolean) => {
      const res = await fetchPostJson({
        path: "/student/archive",
        isSecure: true,
        data: { id, is_archived: is_archived ? 1 : 0 },
        workspaceScope: "personal",
      });
      const student = await res?.json();
      checkResponse(student);
      return student;
    },
    [],
  );

  return { students, getStudents, deleteStudent, setStudentArchived };
};

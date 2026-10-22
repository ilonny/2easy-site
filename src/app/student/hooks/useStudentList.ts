import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { useCallback, useMemo, useState } from "react";
import {
  studentListFetchParams,
  useCatalogWorkspace,
} from "@/app/school/lib/catalogWorkspace";

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
  const workspace = useCatalogWorkspace();
  const fetchWorkspace = useMemo(
    () =>
      studentListFetchParams(
        workspace.workspaceScope ||
          workspace.schoolId ||
          workspace.teacherUserId ||
          workspace.studentScope
          ? workspace
          : { workspaceScope: "personal" },
      ),
    [
      workspace.schoolId,
      workspace.studentScope,
      workspace.teacherUserId,
      workspace.workspaceScope,
    ],
  );

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
      ...fetchWorkspace,
    });
    const data = await res?.json();
    setStudents(Array.isArray(data) ? data : []);
  }, [archived, fetchWorkspace, localStudents]);

  const deleteStudent = useCallback(async (id) => {
    const res = await fetchPostJson({
      path: "/student/delete",
      isSecure: true,
      data: { id },
      ...fetchWorkspace,
    });
    const student = await res?.json();
    checkResponse(student);
    return student;
  }, [fetchWorkspace]);

  const setStudentArchived = useCallback(
    async (id: number, is_archived: boolean) => {
      const res = await fetchPostJson({
        path: "/student/archive",
        isSecure: true,
        data: { id, is_archived: is_archived ? 1 : 0 },
        ...fetchWorkspace,
      });
      const student = await res?.json();
      checkResponse(student);
      return student;
    },
    [fetchWorkspace],
  );

  return { students, getStudents, deleteStudent, setStudentArchived };
};

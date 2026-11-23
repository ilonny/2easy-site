"use client";

import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  brandModalClassNames,
  brandPrimaryBtnClassName,
} from "@/components/brandUi";
import { toast } from "react-toastify";
import { checkResponse, fetchGet, fetchPatch, fetchPostJson } from "@/api";
import { rememberStudentCabinetBack } from "../lib/studentCabinetBack";
import { SchoolMember } from "../types";

type StudentAction = "archive" | "restore" | "delete";

type SchoolStudent = {
  id: number;
  name?: string;
  email?: string;
  user_id?: number | string;
  teacher_name?: string | null;
  is_archived?: number;
  can_manage?: boolean;
};

type CreateSchoolStudentResult = {
  success?: boolean;
  password?: string;
  schedule_events_created?: number;
  first_starts_at?: string;
};

type TProps = {
  schoolId: number;
  canManageAssign: boolean;
  /** Supervisors may leave a student without a private teacher. */
  canLeaveUnassigned?: boolean;
  students: SchoolStudent[];
  members: SchoolMember[];
  onStudentsChanged?: () => Promise<unknown> | void;
  onCreate: (payload: {
    name: string;
    email?: string;
    tag?: string;
    teacher_user_id?: number;
  }) => Promise<CreateSchoolStudentResult>;
  onAttachPersonal?: (
    studentIds: number[],
  ) => Promise<{ success?: boolean; count?: number } | void>;
};

type PersonalStudentRow = {
  id: number;
  name?: string;
  email?: string;
  user_id?: number | string;
  teacher_name?: string | null;
  duplicate_student_id?: number | null;
  school_id?: number | string | null;
  is_archived?: number;
};

export const StudentsPanel: FC<TProps> = ({
  schoolId,
  canManageAssign,
  canLeaveUnassigned = false,
  students,
  members,
  onStudentsChanged,
  onCreate,
  onAttachPersonal,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [ownStudents, setOwnStudents] = useState<PersonalStudentRow[]>([]);
  const [loadingOwn, setLoadingOwn] = useState(false);
  const [studentPick, setStudentPick] = useState("");
  const [personalOpen, setPersonalOpen] = useState(false);
  const [personalStudents, setPersonalStudents] = useState<PersonalStudentRow[]>(
    [],
  );
  const [selectedPersonal, setSelectedPersonal] = useState<number[]>([]);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [personalError, setPersonalError] = useState("");
  const [attachingPersonal, setAttachingPersonal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedStudents, setArchivedStudents] = useState<SchoolStudent[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [studentAction, setStudentAction] = useState<StudentAction | null>(
    null,
  );
  const [actionStudent, setActionStudent] = useState<SchoolStudent | null>(
    null,
  );
  const [savingAction, setSavingAction] = useState(false);
  const [teacherEditStudent, setTeacherEditStudent] =
    useState<SchoolStudent | null>(null);
  const [editTeacherId, setEditTeacherId] = useState("");
  const [savingTeacher, setSavingTeacher] = useState(false);
  const { profile } = useContext(AuthContext);

  const teachers = useMemo(() => {
    const listed = members.filter(
      (m) =>
        m.status === "active" &&
        (m.roles.includes("teacher") ||
          m.roles.includes("head_teacher") ||
          m.roles.includes("methodist") ||
          m.roles.includes("academic_director") ||
          m.roles.includes("super_admin")),
    );
    const selfId = Number(profile?.id);
    const withSelf =
      canManageAssign &&
      selfId > 0 &&
      !listed.some((member) => Number(member.user_id) === selfId)
        ? [
            ...listed,
            {
              id: 0,
              user_id: selfId,
              status: "active",
              roles: ["teacher" as const],
              user: {
                id: selfId,
                login: profile?.login || "",
                name: profile?.name,
                surname: profile?.surname,
              },
            },
          ]
        : listed;
    return [...withSelf].sort((a, b) => {
      const aSelf = Number(a.user_id) === selfId ? 0 : 1;
      const bSelf = Number(b.user_id) === selfId ? 0 : 1;
      if (aSelf !== bSelf) return aSelf - bSelf;
      const aName = [a.user?.name, a.user?.surname].filter(Boolean).join(" ");
      const bName = [b.user?.name, b.user?.surname].filter(Boolean).join(" ");
      return aName.localeCompare(bName, "ru");
    });
  }, [
    canManageAssign,
    members,
    profile?.id,
    profile?.login,
    profile?.name,
    profile?.surname,
  ]);

  const teacherName = (
    userId: string | number | undefined,
    fallbackName?: string | null,
  ) => {
    const m = members.find((x) => String(x.user_id) === String(userId));
    const fromMember =
      [m?.user?.name, m?.user?.surname].filter(Boolean).join(" ") ||
      m?.user?.login;
    const selfName =
      String(userId) === String(profile?.id)
        ? [profile?.name, profile?.surname].filter(Boolean).join(" ") ||
          profile?.login ||
          ""
        : "";
    const named =
      fromMember || String(fallbackName || "").trim() || selfName;
    return named || "—";
  };

  const loadArchivedStudents = useCallback(async () => {
    setLoadingArchived(true);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/students?archived=1`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
      });
      const data = await res.json();
      if (data?.success) {
        setArchivedStudents(data.students || []);
      } else {
        setArchivedStudents([]);
        checkResponse(data);
      }
    } finally {
      setLoadingArchived(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (!canManageAssign && showArchived) setShowArchived(false);
  }, [canManageAssign, showArchived]);

  useEffect(() => {
    if (showArchived) void loadArchivedStudents();
  }, [loadArchivedStudents, showArchived]);

  const visibleStudents = showArchived ? archivedStudents : students;

  const loadPersonalStudents = useCallback(async () => {
    setLoadingPersonal(true);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/students/personal`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
      });
      const data = await res.json();
      if (data?.success) {
        setPersonalError("");
        setPersonalStudents(data.students || []);
      } else {
        setPersonalStudents([]);
        setPersonalError(
          data?.message || i18n.t("school.ownStudentsLoadError"),
        );
        checkResponse(data);
      }
    } finally {
      setLoadingPersonal(false);
    }
  }, [schoolId]);

  const openPersonal = () => {
    setSelectedPersonal([]);
    setPersonalError("");
    setPersonalOpen(true);
    void loadPersonalStudents();
  };

  const togglePersonal = (id: number) => {
    setSelectedPersonal((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const attachPersonal = async () => {
    if (!selectedPersonal.length) {
      toast(i18n.t("school.ownStudentsSelect"), { type: "error" });
      return;
    }
    if (!onAttachPersonal) return;
    setAttachingPersonal(true);
    try {
      const res = await onAttachPersonal(selectedPersonal);
      if (res?.success) {
        toast(
          i18n.t("school.ownStudentsAttached", {
            count: res.count || selectedPersonal.length,
          }),
          { type: "success" },
        );
        setPersonalOpen(false);
        setSelectedPersonal([]);
      }
    } finally {
      setAttachingPersonal(false);
    }
  };

  const openStudentAction = (
    student: SchoolStudent,
    action: StudentAction,
  ) => {
    setActionStudent(student);
    setStudentAction(action);
  };

  const closeStudentAction = () => {
    if (savingAction) return;
    setStudentAction(null);
    setActionStudent(null);
  };

  const applyStudentAction = async () => {
    const studentId = Number(actionStudent?.id);
    if (!studentId || !studentAction) return;

    setSavingAction(true);
    try {
      const res =
        studentAction === "delete"
          ? await fetchPostJson({
              path: "/student/delete",
              isSecure: true,
              workspaceScope: "school",
              schoolId,
              data: { id: studentId },
            })
          : await fetchPostJson({
              path: "/student/archive",
              isSecure: true,
              workspaceScope: "school",
              schoolId,
              data: {
                id: studentId,
                is_archived: studentAction === "archive" ? 1 : 0,
              },
            });
      const data = await res.json();
      if (!data?.success) {
        checkResponse(data);
        return;
      }

      toast(
        i18n.t(
          studentAction === "delete"
            ? "school.studentDeleted"
            : studentAction === "archive"
              ? "school.studentArchived"
              : "school.studentUnarchived",
        ),
        { type: "success" },
      );
      setStudentAction(null);
      setActionStudent(null);
      await onStudentsChanged?.();
      if (showArchived) await loadArchivedStudents();
    } finally {
      setSavingAction(false);
    }
  };

  const teacherItems = useMemo(() => {
    if (!canManageAssign) return [];
    return teachers.map((t) => ({
      id: String(t.user_id),
      label:
        [t.user?.name, t.user?.surname].filter(Boolean).join(" ") ||
        t.user?.login ||
        String(t.user_id),
    }));
  }, [canManageAssign, teachers]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setTag("");
    setTeacherId("");
    setStudentPick("");
    setOwnStudents([]);
  };

  const loadOwnStudents = useCallback(async () => {
    setLoadingOwn(true);
    try {
      const res = await fetchGet({
        path: "/student",
        isSecure: true,
        workspaceScope: "personal",
      });
      const data = await res.json();
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
          ? data.students
          : null;
      if (!rows) {
        setOwnStudents([]);
        setStudentPick("new");
        return;
      }
      const inSchool = new Set(students.map((row) => Number(row.id)));
      const available = rows.filter((row: PersonalStudentRow) => {
        const id = Number(row.id);
        const linkedSchool =
          row.school_id == null || row.school_id === ""
            ? null
            : Number(row.school_id);
        if (!id || inSchool.has(id) || linkedSchool === schoolId) return false;
        if (linkedSchool != null && linkedSchool !== schoolId) return false;
        if (Number(row.is_archived) === 1) return false;
        return true;
      });
      setOwnStudents(available);
      setStudentPick(available.length ? "" : "new");
    } catch {
      setOwnStudents([]);
      setStudentPick("new");
    } finally {
      setLoadingOwn(false);
    }
  }, [schoolId, students]);

  const canEditTeacher = (student: SchoolStudent) =>
    canManageAssign &&
    !showArchived &&
    (canLeaveUnassigned ||
      student.can_manage !== false ||
      !student.user_id);

  const openTeacherEdit = (student: SchoolStudent) => {
    setTeacherEditStudent(student);
    setEditTeacherId(student.user_id ? String(student.user_id) : "");
  };

  const closeTeacherEdit = () => {
    if (savingTeacher) return;
    setTeacherEditStudent(null);
    setEditTeacherId("");
  };

  const saveTeacher = async () => {
    const studentId = Number(teacherEditStudent?.id);
    if (!studentId) return;
    if (canManageAssign && !canLeaveUnassigned && !editTeacherId) {
      toast(i18n.t("school.teacherRequired"), { type: "error" });
      return;
    }
    setSavingTeacher(true);
    try {
      const res = await fetchPatch({
        path: `/school/${schoolId}/students/${studentId}`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
        data: {
          teacher_user_id: editTeacherId ? Number(editTeacherId) : null,
        },
      });
      const data = await res.json();
      if (!data?.success) {
        checkResponse(data);
        return;
      }
      toast(i18n.t("school.teacherUpdated"), { type: "success" });
      setTeacherEditStudent(null);
      setEditTeacherId("");
      await onStudentsChanged?.();
    } finally {
      setSavingTeacher(false);
    }
  };

  const creatingNew = studentPick === "new" || ownStudents.length === 0;
  const pickedStudent = ownStudents.find(
    (row) => String(row.id) === studentPick,
  );

  const submit = async () => {
    if (!creatingNew) {
      if (!pickedStudent) {
        toast(i18n.t("school.pickStudentRequired"), { type: "error" });
        return;
      }
      if (!onAttachPersonal) return;
      setSaving(true);
      try {
        const res = await onAttachPersonal([pickedStudent.id]);
        if (res?.success) {
          toast(i18n.t("school.ownStudentsAttached", { count: 1 }), {
            type: "success",
          });
          setOpen(false);
          resetForm();
        }
      } finally {
        setSaving(false);
      }
      return;
    }
    if (!name.trim()) {
      toast(i18n.t("school.studentNameRequired"), { type: "error" });
      return;
    }
    if (canManageAssign && !canLeaveUnassigned && !teacherId) {
      toast(i18n.t("school.teacherRequired"), { type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await onCreate({
        name: name.trim(),
        email: email.trim() || undefined,
        tag: tag.trim() || undefined,
        teacher_user_id: teacherId ? Number(teacherId) : undefined,
      });
      if (res?.success) {
        const message = res.password
          ? i18n.t("school.studentCreatedWithPassword", {
              password: res.password,
            })
          : i18n.t("school.studentCreated");
        toast(message, { type: "success" });
        setOpen(false);
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T k="school.studentsTitle" />
        </h2>
        {canManageAssign && !showArchived ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="bordered"
              className="border-brand-violet text-brand-violet"
              onPress={openPersonal}
            >
              <T k="school.addOwnStudents" />
            </Button>
            <Button
              className={brandPrimaryBtnClassName}
              onPress={() => {
                resetForm();
                setOpen(true);
                void loadOwnStudents();
              }}
            >
              <T k="school.addStudent" />
            </Button>
          </div>
        ) : null}
      </div>

      {canManageAssign ? (
        <div className="flex gap-2">
          <Button
            radius="full"
            color="primary"
            variant={!showArchived ? "solid" : "bordered"}
            onClick={() => setShowArchived(false)}
            size="sm"
          >
            <T k="students.activeTab" />
          </Button>
          <Button
            radius="full"
            color="primary"
            variant={showArchived ? "solid" : "bordered"}
            onClick={() => setShowArchived(true)}
            size="sm"
          >
            <T k="students.archivedTab" />
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[16px] ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-gray text-brand-grayFont">
            <tr>
              <th className="px-4 py-3 font-medium">
                <T k="school.colName" />
              </th>
              <th className="px-4 py-3 font-medium">
                <T k="school.colEmail" />
              </th>
              <th className="px-4 py-3 font-medium">
                <T k="school.colTeacher" />
              </th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((s) => (
              <tr key={s.id} className="border-t border-black/5">
                <td className="px-4 py-3">{s.name || "—"}</td>
                <td className="px-4 py-3">{s.email || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{teacherName(s.user_id, s.teacher_name)}</span>
                    {canEditTeacher(s) ? (
                      <Button
                        size="sm"
                        variant="light"
                        className="min-w-0 px-2 text-brand-violet"
                        onPress={() => openTeacherEdit(s)}
                      >
                        <T k="school.editTeacher" />
                      </Button>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {!showArchived ? (
                      <Link
                        href={`/student-account/${s.id}?workspace=school&schoolId=${schoolId}&returnTo=${encodeURIComponent(
                          "/school?tab=students",
                        )}`}
                        onClick={() =>
                          rememberStudentCabinetBack(s.id, {
                            teacherUserId: null,
                            returnTo: "/school?tab=students",
                          })
                        }
                        className="font-medium text-brand-violet hover:underline"
                      >
                        <T k="school.openCabinet" />
                      </Link>
                    ) : null}
                    {canManageAssign &&
                    (s.can_manage !== false || !s.user_id) ? (
                      <>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() =>
                            openStudentAction(
                              s,
                              showArchived ? "restore" : "archive",
                            )
                          }
                        >
                          {showArchived ? (
                            <T k="students.unarchive" />
                          ) : (
                            <T k="students.archive" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => openStudentAction(s, "delete")}
                        >
                          <T k="common.delete" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loadingArchived && !visibleStudents.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-brand-grayFont"
                >
                  {showArchived ? (
                    <T k="students.noArchivedStudents" />
                  ) : (
                    <T k="school.noStudents" />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        size="xl"
        isOpen={studentAction != null}
        onClose={closeStudentAction}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            {studentAction === "delete" ? (
              <T
                k="students.deleteStudentConfirm"
                values={{ name: actionStudent?.name || "" }}
              />
            ) : studentAction === "restore" ? (
              <T
                k="students.unarchiveStudentConfirm"
                values={{ name: actionStudent?.name || "" }}
              />
            ) : (
              <T
                k="students.archiveStudentConfirm"
                values={{ name: actionStudent?.name || "" }}
              />
            )}
          </ModalHeader>
          <ModalBody className="pb-6">
            {studentAction === "archive" ? (
              <p className="text-sm text-brand-grayFont">
                <T k="students.archiveStudentHint" />
              </p>
            ) : null}
            <Button
              color={studentAction === "delete" ? "danger" : "primary"}
              variant={studentAction === "delete" ? "light" : "solid"}
              isLoading={savingAction}
              onPress={applyStudentAction}
            >
              {studentAction === "delete" ? (
                <T k="editor.confirmDelete" />
              ) : studentAction === "restore" ? (
                <T k="students.unarchive" />
              ) : (
                <T k="students.archive" />
              )}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={personalOpen}
        onClose={() => {
          if (attachingPersonal) return;
          setPersonalOpen(false);
        }}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.ownStudentsTitle" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <p className="text-sm text-brand-grayFont">
              <T k="school.ownStudentsHint" />
            </p>
            {loadingPersonal ? (
              <p className="text-sm text-brand-grayFont">
                <T k="school.ownStudentsLoading" />
              </p>
            ) : personalError ? (
              <p className="text-sm text-brand-grayFont">{personalError}</p>
            ) : personalStudents.length ? (
              <>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() =>
                      setSelectedPersonal(personalStudents.map((row) => row.id))
                    }
                  >
                    <T k="school.selectAllStudents" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setSelectedPersonal([])}
                  >
                    <T k="school.clearStudentSelection" />
                  </Button>
                </div>
                <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto">
                  {personalStudents.map((row) => (
                    <Checkbox
                      key={row.id}
                      isSelected={selectedPersonal.includes(row.id)}
                      onValueChange={() => togglePersonal(row.id)}
                      classNames={{ base: "max-w-full" }}
                    >
                      <span className="text-sm text-brand-black">
                        {row.name || "—"}
                        {row.teacher_name ? ` · ${row.teacher_name}` : ""}
                      </span>
                      {row.email ? (
                        <span className="block text-xs text-brand-grayFont">
                          {row.email}
                        </span>
                      ) : null}
                      {row.duplicate_student_id ? (
                        <span className="block text-xs text-amber-700">
                          <T k="school.ownStudentsDuplicate" />
                        </span>
                      ) : null}
                    </Checkbox>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-brand-grayFont">
                <T k="school.ownStudentsEmpty" />
              </p>
            )}
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={attachingPersonal}
              isDisabled={!selectedPersonal.length || loadingPersonal}
              onPress={attachPersonal}
            >
              <T k="school.ownStudentsAttach" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={teacherEditStudent != null}
        onClose={closeTeacherEdit}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T
              k="school.editTeacherTitle"
              values={{ name: teacherEditStudent?.name || "" }}
            />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <Select
              label={<T k="school.colTeacher" />}
              placeholder={i18n.t("school.searchTeacher")}
              selectedKeys={
                editTeacherId
                  ? [editTeacherId]
                  : canLeaveUnassigned
                    ? ["none"]
                    : []
              }
              onChange={(e) => {
                const value = e.target.value;
                setEditTeacherId(!value || value === "none" ? "" : value);
              }}
            >
              {canLeaveUnassigned ? (
                <SelectItem key="none" value="none">
                  {i18n.t("school.unassignedTeacher")}
                </SelectItem>
              ) : null}
              {teacherItems.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </SelectItem>
              ))}
            </Select>
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={savingTeacher}
              onPress={saveTeacher}
            >
              <T k="school.saveTeacher" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        isOpen={open}
        onClose={() => setOpen(false)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.addStudent" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            {loadingOwn ? (
              <p className="text-sm text-brand-grayFont">
                <T k="school.ownStudentsLoading" />
              </p>
            ) : null}
            {ownStudents.length > 0 ? (
              <>
                <Select
                  label={<T k="school.pickExistingStudent" />}
                  placeholder={i18n.t("school.pickExistingStudentPlaceholder")}
                  selectedKeys={studentPick ? [studentPick] : []}
                  onChange={(e) => setStudentPick(e.target.value)}
                >
                  {ownStudents.map((row) => (
                    <SelectItem
                      key={String(row.id)}
                      value={String(row.id)}
                      textValue={row.name || row.email || String(row.id)}
                    >
                      {[row.name, row.email].filter(Boolean).join(" · ")}
                    </SelectItem>
                  ))}
                  <SelectItem key="new" value="new">
                    {i18n.t("school.createNewStudentOption")}
                  </SelectItem>
                </Select>
                {pickedStudent ? (
                  <p className="text-sm text-brand-grayFont">
                    <T k="school.existingStudentHint" />
                  </p>
                ) : null}
              </>
            ) : null}
            {creatingNew && !loadingOwn ? (
              <>
            <Input
              label={<T k="school.studentName" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentEmail" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentTag" />}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              radius="lg"
            />
            {canManageAssign && (
              <>
                <Select
                  label={<T k="school.colTeacher" />}
                  placeholder={i18n.t("school.searchTeacher")}
                  selectedKeys={
                    teacherId
                      ? [teacherId]
                      : canLeaveUnassigned
                        ? ["none"]
                        : []
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setTeacherId(!value || value === "none" ? "" : value);
                  }}
                >
                  {canLeaveUnassigned ? (
                    <SelectItem key="none" value="none">
                      {i18n.t("school.unassignedTeacher")}
                    </SelectItem>
                  ) : null}
                  {teacherItems.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.label}
                    </SelectItem>
                  ))}
                </Select>
              </>
            )}
              </>
            ) : null}
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={saving || loadingOwn}
              isDisabled={loadingOwn || (!creatingNew && !pickedStudent)}
              onPress={submit}
            >
              {creatingNew ? (
                <T k="school.saveStudent" />
              ) : (
                <T k="school.ownStudentsAttach" />
              )}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

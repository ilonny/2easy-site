"use client";

import { Button, Image, Input } from "@nextui-org/react";
import { CatalogPageShell } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { brandInputClassNames } from "@/components/brandUi";
import { UserAvatar } from "@/components/UserAvatar";
import { setActiveSchoolId } from "@/app/school/lib/activeSchool";
import { useSchoolBack } from "@/app/school/hooks/useSchoolBack";
import {
  CatalogWorkspaceProvider,
  PERSONAL_CATALOG_WORKSPACE,
} from "@/app/school/lib/catalogWorkspace";

type StudentInfo = {
  id: number;
  name?: string;
  email?: string;
  user_id?: string | number;
  school_id?: number | null;
  tag?: string;
  avatar?: string | null;
  success?: boolean;
};

export default function StudentAccountPage() {
  withLogin();
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolIdFromUrl = Number(searchParams.get("schoolId")) || null;
  const [sourceSchoolId, setSourceSchoolId] = useState<number | null>(
    schoolIdFromUrl,
  );
  const goBack = useSchoolBack(
    sourceSchoolId ? "/school?tab=students" : "/profile?students",
  );
  const studentId = useParams()?.id;
  const isBoardsTab = searchParams.get("tab") === "boards";
  const isCoursesTab = searchParams.get("tab") === "courses";
  const isScheduleTab = searchParams.get("tab") === "schedule";
  const activeTab = searchParams.get("tab") || "lessons";

  const { profile, authIsLoading } = useContext(AuthContext);

  const [studentInfo, setStudentInfo] = useState<StudentInfo | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudentInfo = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchGet({
      path: `/student-info?id=${studentId}`,
      isSecure: true,
      workspaceScope: sourceSchoolId ? "school" : undefined,
      schoolId: sourceSchoolId,
    });
    const json = await res?.json();
    checkResponse(json);
    if (json.success) {
      setStudentInfo(json);
      if (json.school_id) {
        const schoolId = Number(json.school_id);
        setSourceSchoolId(schoolId);
        setActiveSchoolId(schoolId);
      }
    }
    setIsLoading(false);
    return json;
  }, [studentId, sourceSchoolId]);

  useEffect(() => {
    if (schoolIdFromUrl) setSourceSchoolId(schoolIdFromUrl);
  }, [schoolIdFromUrl]);

  useEffect(() => {
    fetchStudentInfo();
  }, [studentId, fetchStudentInfo]);

  useEffect(() => {
    setSearchString("");
  }, [activeTab]);

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const [dictionaryModalOpen, setDictionaryModalOpen] = useState(false);

  const isSchoolStudent = useMemo(
    () =>
      sourceSchoolId != null ||
      (studentInfo?.school_id != null && Number(studentInfo.school_id) > 0),
    [studentInfo, sourceSchoolId],
  );
  const catalogWorkspace = useMemo(
    () =>
      isSchoolStudent && sourceSchoolId
        ? { workspaceScope: "school" as const, schoolId: sourceSchoolId }
        : PERSONAL_CATALOG_WORKSPACE,
    [isSchoolStudent, sourceSchoolId],
  );

  const backLabel = isSchoolStudent
    ? i18n.t("students.backToSchool")
    : i18n.t("students.allStudents");

  return (
    <CatalogPageShell
      title={
        isSchoolStudent ? (
          <T k="students.schoolStudentCabinet" />
        ) : (
          <T k="students.studentCabinet" />
        )
      }
      subtitle={
        isTeacher ? (
          <button
            type="button"
            onClick={goBack}
            className="text-sm text-brand-violet hover:opacity-80"
          >
            {backLabel}
          </button>
        ) : undefined
      }
    >
      {(isLoading || authIsLoading) && (
        <div className="flex h-[225px] w-full items-center justify-center">
          <Button
            isIconOnly
            isLoading={isLoading}
            color="primary"
            variant="light"
            size="lg"
          />
        </div>
      )}
      <div className="flex w-full min-w-0 flex-col items-stretch gap-4 lg:flex-row lg:gap-6">
        <div className="w-full min-w-0 shrink-0 lg:w-[415px]">
          {!!studentInfo && isTeacher && isSchoolStudent && (
            <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={studentInfo.name}
                  avatar={studentInfo.avatar}
                  size={56}
                />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-brand-black">
                    {studentInfo.name || "—"}
                  </p>
                  <p className="truncate text-sm text-brand-grayFont">
                    {studentInfo.email || "—"}
                  </p>
                  {studentInfo.tag ? (
                    <p className="mt-1 text-xs text-brand-grayFont">
                      {studentInfo.tag}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-brand-violet">
                    <T k="students.schoolStudentBadge" />
                  </p>
                </div>
              </div>
            </div>
          )}
          {!!studentInfo && isTeacher && !isSchoolStudent && (
            <StudentList
              onSuccessEditCallback={fetchStudentInfo}
              onSuccessDeleteCallback={() => router.push("/profile?students")}
              hideAccountButton
              studentsList={[studentInfo as any]}
              hideAddButton
            />
          )}
        </div>
        {!isScheduleTab && (
          <div className="w-full min-w-0 lg:max-w-[525px] lg:flex-1">
            <Input
              value={searchString}
              onValueChange={setSearchString}
              placeholder={
                isBoardsTab
                  ? i18n.t("boards.searchBoards")
                  : isCoursesTab
                    ? i18n.t("lessons.searchCourses")
                    : i18n.t("lessons.searchLessons")
              }
              size="md"
              classNames={brandInputClassNames}
              startContent={
                <Image
                  src={Loupe.src}
                  alt="search"
                  style={{ borderRadius: 0 }}
                />
              }
            />
          </div>
        )}
      </div>
      {!!studentInfo && (
        <CatalogWorkspaceProvider value={catalogWorkspace}>
          <ProfileLessons
            searchString={searchString}
            canCreateLesson={false}
            //@ts-ignore
            studentId={studentId}
            studentInfo={studentInfo}
            canEditSchedule={!!isTeacher}
            hideTabs
            hideAttachButton
            showChangeStatusButton
            hideDeleteLessonButton
            showStartLessonButton
            isStudent={isStudent}
            alwaysOpenLessonMode={true}
            includeCourseLessons
            dictionaryModalOpen={dictionaryModalOpen}
            onDictionaryModalChange={setDictionaryModalOpen}
          />
        </CatalogWorkspaceProvider>
      )}
    </CatalogPageShell>
  );
}

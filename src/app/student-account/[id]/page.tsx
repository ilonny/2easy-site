"use client";

import { Button, Image, Input } from "@nextui-org/react";
import { CatalogPageShell } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import Link from "next/link";
import { brandInputClassNames } from "@/components/brandUi";

export default function StudentAccountPage() {
  withLogin();
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = useParams()?.id;
  const isBoardsTab = searchParams.get("tab") === "boards";
  const isCoursesTab = searchParams.get("tab") === "courses";
  const activeTab = searchParams.get("tab") || "lessons";

  const { profile, authIsLoading } = useContext(AuthContext);

  const [studentInfo, setStudentInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudentInfo = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchGet({
      path: `/student-info?id=${studentId}`,
      isSecure: true,
    });
    const json = await res?.json();
    checkResponse(json);
    if (json.success) {
      setStudentInfo(json);
    }
    setIsLoading(false);
    return json;
  }, [studentId]);

  useEffect(() => {
    fetchStudentInfo();
  }, [studentId, fetchStudentInfo]);

  useEffect(() => {
    setSearchString("");
  }, [activeTab]);

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const [dictionaryModalOpen, setDictionaryModalOpen] = useState(false);

  return (
    <CatalogPageShell
      title={<T k="students.studentCabinet" />}
      subtitle={
        isTeacher ? (
          <Link
            href="/profile?students"
            className="text-sm text-brand-violet hover:opacity-80"
          >
            <T k="students.allStudents" />
          </Link>
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
          {!!studentInfo && isTeacher && (
            <StudentList
              onSuccessEditCallback={fetchStudentInfo}
              onSuccessDeleteCallback={() => router.push("/profile?students")}
              hideAccountButton
              studentsList={[studentInfo]}
              hideAddButton
            />
          )}
        </div>
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
              <Image src={Loupe.src} alt="search" style={{ borderRadius: 0 }} />
            }
          />
        </div>
      </div>
      {!!studentInfo && (
        <ProfileLessons
          searchString={searchString}
          canCreateLesson={false}
          //@ts-ignore
          studentId={studentId}
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
      )}
    </CatalogPageShell>
  );
}

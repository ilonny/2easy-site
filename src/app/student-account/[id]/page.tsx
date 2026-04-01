"use client";
import { useTranslation } from "react-i18next";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Image,
  Input,
  Link,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";

export default function StudentAccountPage() {
  withLogin();
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const studentId = useParams()?.id;

  const { subscription } = useContext(SibscribeContext);
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

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 sm:h-10 md:h-14" />
          {isTeacher && (
            <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
              <Breadcrumbs>
                <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
                <BreadcrumbItem href="/profile?students">
                  {t("profile.myStudents")}
                </BreadcrumbItem>
                {!!studentInfo && (
                  <BreadcrumbItem>{studentInfo.name}</BreadcrumbItem>
                )}
              </Breadcrumbs>
            </div>
          )}
        </div>
        <div className="h-6 sm:h-8 md:h-10" />
        <div className="flex flex-col items-center gap-3 w-full min-w-0 px-1">
          <h1 className="text-primary text-center font-bold text-xl sm:text-2xl md:text-3xl uppercase px-2 break-words w-full">
            {t("students.studentCabinet")}
          </h1>
          {isTeacher ? (
            <Link
              href="/profile?students"
              className="text-sm sm:text-base text-primary underline-offset-2 hover:underline self-center sm:self-start"
            >
              {t("students.allStudents")}
            </Link>
          ) : null}
        </div>
        {isStudent && <div className="h-1" />}
        <div className="h-4 sm:h-5" />
        {(isLoading || authIsLoading) && (
          <div className="w-full h-[225px] flex justify-center items-center ">
            <Button
              isIconOnly
              isLoading={isLoading}
              color="primary"
              variant="light"
              size="lg"
            />
          </div>
        )}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6 w-full min-w-0">
          <div className="w-full lg:w-[415px] min-w-0 shrink-0">
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
          <div className="w-full lg:flex-1 lg:max-w-[525px] min-w-0">
            <Input
              value={searchString}
              onValueChange={setSearchString}
              placeholder={t("lessons.searchLessons")}
              size="lg"
              classNames={{ inputWrapper: "bg-white hove min-w-0" }}
              startContent={
                <Image
                  src={Loupe.src}
                  alt="search"
                  style={{ borderRadius: 0 }}
                />
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
          />
        )}
      </ContentWrapper>
    </main>
  );
}

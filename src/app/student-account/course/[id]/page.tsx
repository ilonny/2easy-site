/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useTranslation } from "react-i18next";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useMemo } from "react";
import { withLogin } from "@/auth/hooks/withLogin";
import { useParams } from "next/navigation";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { useCourses } from "@/app/course/hooks/useCourses";

export default function StudentCoursePage() {
  withLogin();
  const { t } = useTranslation();
  const params = useParams();
  const { profile, authIsLoading } = useContext(AuthContext);
  const isStudent = profile?.isStudent;
  const { getCourses, courses } = useCourses();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id == params.id);
  }, [courses, params.id]);

  const studentIdStr =
    isStudent && profile?.studentId != null ? String(profile.studentId) : "";

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 sm:h-10 md:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
              <BreadcrumbItem href={`/`}>
                {t("profile.personalCabinetBreadcrumb")}
              </BreadcrumbItem>
              <BreadcrumbItem href="/course">{t("lessons.course")}</BreadcrumbItem>
            </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 sm:h-8 md:h-10" />
        {!authIsLoading &&
          !!currentCourse &&
          !!studentIdStr && (
            <ProfileLessons
              currentCourse={currentCourse}
              canCreateLesson={false}
              studentId={studentIdStr}
              hideTabs
              hideAttachButton
              showChangeStatusButton
              hideDeleteLessonButton
              showStartLessonButton
              isStudent={!!isStudent}
              alwaysOpenLessonMode
              includeCourseLessons
            />
          )}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

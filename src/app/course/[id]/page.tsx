/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useTranslation } from "react-i18next";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { Suspense, useContext, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { useCourses } from "../hooks/useCourses";
import { AuthContext } from "@/auth";

function CoursePageContent() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const { getCourses, courses } = useCourses();

  const studentIdFromQuery = (searchParams.get("student_id") ?? "").trim();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id == params.id);
  }, [courses, params.id]);

  const { profile } = useContext(AuthContext);
  const roleId = Number(profile?.role_id);
  const isTeacher = roleId === 2 || roleId === 1;

  const studentIdForApi = studentIdFromQuery;
  const teacherStudentMode = !!studentIdFromQuery && isTeacher;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem href="/lesson_plans">{t("header.lessonPlans")}</BreadcrumbItem>
            <BreadcrumbItem>{currentCourse?.title}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        {!!currentCourse && (
          <ProfileLessons
            currentCourse={currentCourse}
            showChangeStatusButton={teacherStudentMode}
            hideAttachButton
            hideTabs
            studentId={studentIdForApi}
            showCourseSearch={true}
            showStartLessonButton={isTeacher}
            isStudent={false}
            includeCourseLessons={!!studentIdFromQuery && isTeacher}
            alwaysOpenLessonMode
          />
        )}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={null}>
      <CoursePageContent />
    </Suspense>
  );
}

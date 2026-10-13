/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { CatalogPageShell } from "@/components";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useMemo } from "react";
import { withLogin } from "@/auth/hooks/withLogin";
import { useParams } from "next/navigation";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { useCourses } from "@/app/course/hooks/useCourses";
import { T } from "@/i18n/T";

export default function StudentCoursePage() {
  withLogin();
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
    <CatalogPageShell
      title={currentCourse?.title || <T k="lessons.course" />}
    >
      {!authIsLoading && !!currentCourse && !!studentIdStr && (
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
    </CatalogPageShell>
  );
}

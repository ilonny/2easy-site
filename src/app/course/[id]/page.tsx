/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { useContext, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { useCourses } from "../hooks/useCourses";
import { AuthContext } from "@/auth";

export default function StartRegistrationPage() {
  const params = useParams();
  const { getCourses, courses } = useCourses();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id == params.id);
  }, [courses, params.id]);

  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const student_id =
    (isTeacher &&
      new URL(window.location.href).searchParams?.get("student_id")) ||
    "";

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/lesson_plans">Lesson plans</BreadcrumbItem>
            <BreadcrumbItem>{currentCourse?.title}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        {!!currentCourse && (
          <ProfileLessons
            currentCourse={currentCourse}
            showChangeStatusButton={!!student_id}
            hideAttachButton
            hideTabs
            studentId={student_id}
          />
        )}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

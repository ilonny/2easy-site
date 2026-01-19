/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { useCourses } from "../hooks/useCourses";

export default function StartRegistrationPage() {
  const params = useParams();
  const { getCourses, courses } = useCourses();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id == params.id);
  }, [courses, params.id]);

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
            // showChangeStatusButton
            hideAttachButton
            hideTabs
          />
        )}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

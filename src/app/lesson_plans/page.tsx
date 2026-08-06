"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs, Image } from "@nextui-org/react";
import { useContext } from "react";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { T } from "@/i18n/T";
import { AuthContext } from "@/auth";
import Dino from "@/assets/images/dino.gif";

export default function LessonPlansPage() {
  const { authIsLoading } = useContext(AuthContext);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 sm:h-10 md:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
              <BreadcrumbItem href="/"><T k="editor.home" /></BreadcrumbItem>
              <BreadcrumbItem href="/lesson_plans"><T k="header.lessonPlans" /></BreadcrumbItem>
            </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 sm:h-8 md:h-10" />
        <h1 className="text-center text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-bold text-primary px-2 break-words">
          <T k="header.lessonPlans" />
        </h1>
        <div className="h-6 sm:h-8 md:h-10" />
        {authIsLoading ? (
          <div className="w-full h-[500px] flex justify-center items-center">
            <Image src={Dino.src} alt="dino animated" width={150} height={150} />
          </div>
        ) : (
          <ProfileLessons />
        )}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

"use client";

import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { ProfileLessons } from "../lessons/components/ProfileLessons";

export default function LessonPlansPage() {
  const { t } = useTranslation();
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  // useEffect(() => {
  //   if (!checkSubscription()) {
  //     router.push("/subscription");
  //   }
  // }, [checkSubscription, router]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 sm:h-10 md:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
              <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
              <BreadcrumbItem href="/lesson_plans">{t("header.lessonPlans")}</BreadcrumbItem>
            </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 sm:h-8 md:h-10" />
        <h1 className="text-center text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] font-bold text-primary px-2 break-words">
          LESSON PLANS
        </h1>
        <div className="h-6 sm:h-8 md:h-10" />
        <ProfileLessons />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

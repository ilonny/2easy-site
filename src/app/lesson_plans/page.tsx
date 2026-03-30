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
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem href="/lesson_plans">{t("header.lessonPlans")}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          LESSON PLANS
        </h1>
        <div className="h-10" />
        <div className="h-10" />
        <ProfileLessons />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { ProfileLessons } from "../lessons/components/ProfileLessons";

export default function GrammarPage() {
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
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/lesson_plans">Lessons plans</BreadcrumbItem>
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
          LESSONS PLANS
        </h1>
        <p
          className="max-w-[745px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          Ready-to-use lessons on current topics with juicy vocabulary,
          authentic videos and stories, complemented by grammar topics,
          exercises and quizzes.
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <ProfileLessons />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

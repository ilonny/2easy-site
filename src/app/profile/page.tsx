"use client";
import { useTranslation } from "react-i18next";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { ProfileInfoForm } from "./components/ProfileInfoForm";
import { ProfileSubscribeInformer } from "../subscription/components/ProfileSubscribeInformer";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { ProfileStudents } from "../student/components/ProfileStudents";
import { withLogin } from "@/auth/hooks/withLogin";

export default function ProfilePage() {
  withLogin();
  const { t } = useTranslation();
  const { authIsLoading } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);
  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  const [tabIndex, setTabIndex] = useState<"profile" | "lessons" | "students">(
    "lessons"
  );

  useEffect(() => {
    if (window.location.search?.includes("lessons")) {
      setTabIndex("lessons");
    }
    if (window.location.search?.includes("profile")) {
      setTabIndex("profile");
    }
    if (window.location.search?.includes("students")) {
      setTabIndex("students");
    }
  }, []);

  // useEffect(() => {
  //   console.log('')
  //   if (!authIsLoading && !profile?.id) {
  //     toast("Ошибка авторизации", {
  //       type: "success",
  //     });
  //     router.push("/login");
  //   }
  // }, [authIsLoading && !profile]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 md:h-10 lg:h-14" />
          <div className="overflow-x-auto max-w-full [-webkit-overflow-scrolling:touch] pb-0.5">
            <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem>{t("profile.profileLabel")}</BreadcrumbItem>
          </Breadcrumbs>
          </div>
        </div>
        <div className="h-6 md:h-8 lg:h-10" />
        <div className="h-6 md:h-8 lg:h-10" />
        <div className="flex flex-col items-center w-full max-w-full min-w-0 px-0">
          <h1 className="text-primary font-bold text-xl sm:text-2xl md:text-3xl uppercase text-center px-1">
            {t("profile.personalCabinet")}
          </h1>
          <div className="h-4 md:h-5" />
          <Tabs
            selectedKey={tabIndex}
            onSelectionChange={setTabIndex}
            variant="underlined"
            color="primary"
            classNames={{
              base: "w-full max-w-full min-w-0",
              tabList:
                "w-full max-w-full min-w-0 flex-nowrap gap-1 sm:gap-2 justify-center overflow-x-auto [-webkit-overflow-scrolling:touch] pb-0.5",
              /* theme задаёт tab:w-full — из‑за этого каждая вкладка = 100% ширины, видна только первая */
              tab: "w-auto shrink-0 px-2 sm:px-3 text-xs sm:text-sm md:text-base",
            }}
          >
            <Tab
              key="lessons"
              title={t("profile.lessonsAndCourses")}
              className="uppercase font-bold"
            />
            <Tab
              key="students"
              title={t("profile.studentsTab")}
              className="uppercase font-bold"
            />
            <Tab
              key="profile"
              title={t("profile.profileLabel")}
              className="uppercase font-bold"
            />
          </Tabs>
          <div className="h-6 md:h-8 lg:h-10" />
          <div className="h-6 md:h-8 lg:h-10" />
          {tabIndex === "profile" && !authIsLoading && (
            <div className="flex flex-col xl:flex-row items-stretch xl:items-start justify-center w-full max-w-full min-w-0 gap-8 md:gap-12 xl:gap-24 2xl:gap-40 px-1">
              <ProfileInfoForm />
              <ProfileSubscribeInformer />
            </div>
          )}
          {tabIndex === "lessons" && !authIsLoading && <ProfileLessons />}
          {tabIndex === "students" && !authIsLoading && <ProfileStudents />}
          <div className="h-12 md:h-16 lg:h-20" />
        </div>
      </ContentWrapper>
    </main>
  );
}

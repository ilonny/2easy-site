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
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">{t("editor.home")}</BreadcrumbItem>
            <BreadcrumbItem>{t("profile.profileLabel")}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex flex-col items-center">
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            {t("profile.personalCabinet")}
          </h1>
          <div className="h-5" />
          <Tabs
            selectedKey={tabIndex}
            onSelectionChange={setTabIndex}
            variant="underlined"
            color="primary"
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
          <div className="h-10" />
          <div className="h-10" />
          <div className="mx-8"></div>
          {tabIndex === "profile" && !authIsLoading && (
            <div
              className="
              flex
              items-start
              justify-center
              w-full
              flex-wrap
              lg:gap-40
            "
            >
              <ProfileInfoForm />
              <ProfileSubscribeInformer />
            </div>
          )}
          {tabIndex === "lessons" && !authIsLoading && <ProfileLessons />}
          {tabIndex === "students" && !authIsLoading && <ProfileStudents />}
          <div className="h-20" />
        </div>
      </ContentWrapper>
    </main>
  );
}

"use client";

import { CatalogPageShell, BrandPill } from "@/components";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import { ProfileInfoForm } from "./components/ProfileInfoForm";
import { ProfileSubscribeInformer } from "../subscription/components/ProfileSubscribeInformer";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { ProfileStudents } from "../student/components/ProfileStudents";
import { withLogin } from "@/auth/hooks/withLogin";
import { T } from "@/i18n/T";

export default function ProfilePage() {
  withLogin();
  const { authIsLoading, profile } = useContext(AuthContext);
  const isStudent = !!profile?.isStudent;

  const [tabIndex, setTabIndex] = useState<"profile" | "lessons" | "students">(
    isStudent ? "profile" : "lessons",
  );

  useEffect(() => {
    if (isStudent) {
      setTabIndex("profile");
      return;
    }
    if (window.location.search?.includes("lessons")) {
      setTabIndex("lessons");
    }
    if (window.location.search?.includes("profile")) {
      setTabIndex("profile");
    }
    if (window.location.search?.includes("students")) {
      setTabIndex("students");
    }
  }, [isStudent]);

  return (
    <CatalogPageShell
      title={
        <T
          k={isStudent ? "profile.personalData" : "profile.personalCabinet"}
        />
      }
    >
      {!isStudent && (
        <div className="flex flex-wrap justify-center gap-1.5 min-[1200px]:gap-3">
          <BrandPill
            active={tabIndex === "lessons"}
            onClick={() => setTabIndex("lessons")}
          >
            <T k="profile.lessonsAndCourses" />
          </BrandPill>
          <BrandPill
            active={tabIndex === "students"}
            onClick={() => setTabIndex("students")}
          >
            <T k="profile.studentsTab" />
          </BrandPill>
          <BrandPill
            active={tabIndex === "profile"}
            onClick={() => setTabIndex("profile")}
          >
            <T k="profile.profileLabel" />
          </BrandPill>
        </div>
      )}
      {(tabIndex === "profile" || isStudent) && !authIsLoading && (
        <div className="flex w-full min-w-0 max-w-full flex-col items-stretch justify-center gap-8 px-1 md:gap-12 xl:flex-row xl:items-start xl:gap-24 2xl:gap-40">
          <ProfileInfoForm />
          {!isStudent && <ProfileSubscribeInformer />}
        </div>
      )}
      {tabIndex === "lessons" && !isStudent && !authIsLoading && (
        <ProfileLessons />
      )}
      {tabIndex === "students" && !isStudent && !authIsLoading && (
        <ProfileStudents />
      )}
    </CatalogPageShell>
  );
}

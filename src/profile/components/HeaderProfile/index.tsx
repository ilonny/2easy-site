"use client";
import { useContext, useMemo } from "react";
import { AuthContext } from "@/auth";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

import { fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";
import { useRouter } from "next/navigation";
import ChevronDown from "@/assets/icons/chevron_down.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  isStudent?: boolean;
};

export const HeaderProfile = (props: TProps) => {
  const { isStudent } = props;
  const { profile, setProfile } = useContext(AuthContext);
  const router = useRouter();

  const logout = () => {
    fetchPostJson({
      path: "/logout",
      isSecure: true,
      data: {},
    });
    writeToLocalStorage("token", "");
    writeToLocalStorage("profile", "");
    setProfile({});
    router.replace("/");
  };

  return (
    <Dropdown placement="bottom-end" offset={8}>
      <DropdownTrigger>
        <Button
          variant="light"
          style={{ outline: "none" }}
          className="h-10 min-w-0 max-w-[46vw] touch-manipulation gap-2 rounded-[14px] bg-brand-gray px-3.5 text-xs font-bold tracking-brand text-brand-black data-[hover=true]:bg-[#e6e6ea] sm:max-w-[200px] md:h-[46px] md:max-w-none lg:h-12 lg:text-sm"
        >
          <p className="truncate">
            {profile.name || i18n.t("profile.profileLabel")}
          </p>
          <Image src={ChevronDown} alt="profile icon" width={14} className="shrink-0" />
        </Button>
      </DropdownTrigger>
      {isStudent ? (
        <DropdownMenu aria-label="Profile Actions" itemClasses={{ base: "touch-manipulation" }}>
          <DropdownItem
            key="profile"
            className="touch-manipulation"
            onPress={() => {
              if (profile?.studentId != null) {
                router.push(`/student-account/${profile.studentId}`);
              }
            }}
            textValue={profile?.name || "profile"}
          >
            <span className="header-secondary-btn-text block">{profile?.name}</span>
            {!!profile?.email && (
              <span className="block text-sm text-default-500">{profile.email}</span>
            )}
          </DropdownItem>
          <DropdownItem key="logout" className="touch-manipulation" onPress={logout}>
            <T k="auth.logout" />
          </DropdownItem>
        </DropdownMenu>
      ) : (
        <DropdownMenu aria-label="Profile Actions" itemClasses={{ base: "touch-manipulation" }}>
          <DropdownItem
            key="lessons"
            className="touch-manipulation"
            onPress={() => router.push("/lesson_plans")}
            textValue={i18n.t("profile.lessonsAndCourses")}
          >
            <T k="profile.lessonsAndCourses" />
          </DropdownItem>
          <DropdownItem
            key="students"
            className="touch-manipulation"
            onPress={() => router.push("/profile?students")}
            textValue={i18n.t("profile.myStudents")}
          >
            <T k="profile.myStudents" />
          </DropdownItem>
          <DropdownItem
            key="profile"
            className="touch-manipulation"
            onPress={() => router.push("/profile?profile")}
            textValue={i18n.t("profile.personalData")}
          >
            <T k="profile.personalData" />
          </DropdownItem>
          <DropdownItem key="logout" className="touch-manipulation" onPress={logout}>
            <T k="auth.logout" />
          </DropdownItem>
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

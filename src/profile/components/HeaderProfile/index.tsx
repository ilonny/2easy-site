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
          color="secondary"
          variant="flat"
          style={{ outline: "none" }}
          className="header-secondary-bg touch-manipulation"
        >
          <p
            className="hidden md:block lg:block header-secondary-btn-text"
            style={{ color: "#4031C3 !important" }}
          >
            {profile.name || i18n.t("profile.profileLabel")}
          </p>
          <p
            className="block md:hidden lg:hidden header-secondary-btn-text"
            style={{ color: "#4031C3 !important" }}
          >
            {profile.name?.[0] || i18n.t("profile.profileLabel")}
          </p>
          <Image src={ChevronDown} alt="profile icon" width={14} />
          {/* <p className={styles.title}>{profile.name?.[0] || "A"}</p> */}
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

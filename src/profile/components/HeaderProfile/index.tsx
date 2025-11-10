"use client";
import { useContext, useMemo } from "react";
import styles from "./styles.module.css";
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
import { redirect, useRouter } from "next/navigation";
import ChevronDown from "@/assets/icons/chevron_down.svg";
import Link from "next/link";
import Image from "next/image";

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
    <Dropdown>
      <DropdownTrigger>
        <Button
          color="secondary"
          variant="flat"
          style={{ outline: "none" }}
          className="header-secondary-bg"
        >
          <p
            className="hidden md:block lg:block"
            style={{ color: "#4031C3 !important" }}
          >
            {profile.name || "Профиль"}
          </p>
          <p
            className="block md:hidden lg:hidden"
            style={{ color: "#4031C3 !important" }}
          >
            {profile.name?.[0] || "Профиль"}
          </p>
          <Image src={ChevronDown} alt="profile icon" width={14} />
          {/* <p className={styles.title}>{profile.name?.[0] || "A"}</p> */}
        </Button>
      </DropdownTrigger>
      {isStudent ? (
        <DropdownMenu aria-label="Profile Actions">
          <DropdownItem
            key="profile"
            href={`/student-account/${profile?.studentId}`}
          >
            <Link href={`/student-account/${profile?.studentId}`}>
              <p>{profile?.name}</p>
              {!!profile?.email && <p>{profile?.email}</p>}
            </Link>
          </DropdownItem>
          <DropdownItem onClick={logout} key="logout">
            Выйти
          </DropdownItem>
        </DropdownMenu>
      ) : (
        <DropdownMenu aria-label="Profile Actions">
          <DropdownItem key="lessons" href="/profile?lessons">
            <p>Мои уроки</p>
          </DropdownItem>
          <DropdownItem key="students" href="/profile?students">
            <p>Мои ученики</p>
          </DropdownItem>
          <DropdownItem key="profile" href="/profile?profile">
            <p>Личные данные</p>
          </DropdownItem>
          <DropdownItem onClick={logout} key="logout">
            Выйти
          </DropdownItem>
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

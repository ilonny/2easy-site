"use client";
import { useContext } from "react";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

import { fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
export const HeaderProfile = () => {
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
        <button
          className={styles["header-profile-short-wrapper"]}
          style={{ outline: "none" }}
        >
          <p className={styles.title}>{profile.name?.[0] || "A"}</p>
        </button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions">
        <DropdownItem key="profile">
          <Link href="/profile?lessons">Мои уроки</Link>
        </DropdownItem>
        <DropdownItem key="profile">
          <Link href="/profile?students">Мои ученики</Link>
        </DropdownItem>
        <DropdownItem key="profile">
          <Link href="/profile?profile">Личные данные</Link>
        </DropdownItem>
        <DropdownItem onClick={logout} key="logout">
          Выйти
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

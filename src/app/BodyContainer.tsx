"use client";
import { AuthContext } from "@/auth";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { FC, useContext, useEffect } from "react";

export const BodyContainer: FC<any> = ({ children }) => {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    if (
      profile?.isStudent &&
      !window?.location?.pathname?.includes("/lessons/") &&
      !window?.location?.pathname?.includes("/login") &&
      !window?.location?.pathname?.includes("/taboo") &&
      !window?.location?.pathname?.includes("course") &&
      !window?.location?.pathname?.includes("student-account")
    ) {
      router.push(`/student-account/${profile.studentId}`);
    }
  }, [profile?.isStudent, profile.studentId, router]);
  return children;
};

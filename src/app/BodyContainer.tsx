"use client";
import { AuthContext } from "@/auth";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { FC, useContext, useEffect } from "react";

export const BodyContainer: FC<any> = ({ children }) => {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  console.log('BodyContainer render')
  useEffect(() => {
    if (profile?.isStudent) {
      router.push(`/student-account/${profile.studentId}`);
    }
  }, [profile?.isStudent]);
  return children;
};

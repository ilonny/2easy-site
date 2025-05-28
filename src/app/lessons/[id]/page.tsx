"use client";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Image,
  Input,
  Link,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";

export default function StartRegistrationPage() {
  withLogin();
  const router = useRouter();
  const { subscription } = useContext(SibscribeContext);
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          {isTeacher && (
            <Breadcrumbs>
              <BreadcrumbItem href="/">Главная</BreadcrumbItem>
              <BreadcrumbItem href="/profile?students">
                Мои ученики
              </BreadcrumbItem>
            </Breadcrumbs>
          )}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end justify-center gap-6">
          <Link href="/profile?students">← все ученики</Link>
          <h1
            className={"text-primary text-center font-bold text-3xl uppercase"}
          >
            Кабинет ученика
          </h1>
          <div className="w-[112px]"></div>
        </div>
      </ContentWrapper>
    </main>
  );
}

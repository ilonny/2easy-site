"use client";

import { fetchGet } from "@/api";
import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { useCheckSubscription } from "../subscription/helpers";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Dino from "@/assets/images/dino.gif";
import { LessonsList } from "../lessons/components/LessonsList";

export default function GrammarPage() {
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (!checkSubscription()) {
      router.push("/subscription");
    }
  }, [checkSubscription, router]);

  const getLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchGet({
        path: "/lessons/grammar",
        isSecure: true,
      });

      const data = await res.json();
      setLessons(data.lessons);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasSubscription) {
      getLessons();
    }
  }, [hasSubscription, getLessons]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/grammar">Grammar</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          GRAMMAR
        </h1>
        <p
          className="max-w-[600px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          В этом разделе нет теории, правил и заданий на раскрытие скобок. Мы
          собрали здесь только разговорные упражнения и игры, чтобы после
          прохождения грамматической темы ученик сразу мог отработать ее в речи
        </p>
        <div className="h-10" />
        <div className="h-10" />
        {isLoading && (
          <div className="w-full h-[500px] flex justify-center items-center ">
            <Image
              src={Dino.src}
              alt="dino animated"
              width={150}
              height={150}
            />
          </div>
        )}
        <LessonsList
          canCreateLesson={false}
          lessons={lessons}
          getLessons={getLessons}
          hideAttachButton={true}
          hideContextMenu={false}
          showChangeStatusButton={false}
          hideDeleteLessonButton={true}
          isStudent={false}
          
        />
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}

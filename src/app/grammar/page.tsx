"use client";

import { fetchGet } from "@/api";
import { CatalogPageShell } from "@/components";
import { Input, Image } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCheckSubscription } from "../subscription/helpers";
import { useRouter } from "next/navigation";

import Dino from "@/assets/images/dino.gif";
import { LessonsList } from "../lessons/components/LessonsList";
import Loupe from "@/assets/icons/loupe.svg";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

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

  const [lessonsSearchString, setLessonsSearchString] = useState("");

  const searchedLessons = useMemo(() => {
    if (!lessonsSearchString) {
      return lessons;
    }

    return lessons.filter((f) => {
      return f?.title.toLowerCase().includes(lessonsSearchString.toLowerCase());
    });
  }, [lessonsSearchString, lessons]);

  return (
    <CatalogPageShell
      title={<T k="grammarPage.title" />}
      subtitle={<T k="grammarPage.subtitle" />}
    >
      {isLoading && (
        <div className="flex h-[500px] w-full items-center justify-center">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      )}
      <div className="mx-auto w-full max-w-[525px]">
        <Input
          value={lessonsSearchString}
          onValueChange={setLessonsSearchString}
          placeholder={i18n.t("lessons.searchLessons")}
          size="lg"
          classNames={{
            inputWrapper:
              "rounded-[14px] bg-brand-gray shadow-none hover:bg-[#e6e6ea] group-data-[focus=true]:bg-brand-gray",
            input: "font-bold tracking-brand text-brand-black",
          }}
          startContent={
            <Image src={Loupe.src} alt="search" style={{ borderRadius: 0 }} />
          }
        />
      </div>
      <LessonsList
        canCreateLesson={false}
        lessons={searchedLessons}
        getLessons={getLessons}
        getCourses={() => {}}
        hideAttachButton={true}
        hideContextMenu={false}
        showChangeStatusButton={false}
        hideDeleteLessonButton={true}
        isStudent={false}
      />
    </CatalogPageShell>
  );
}

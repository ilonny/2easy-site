"use client";
import { SubscribeCounter } from "@/subscribe/components";
import { HeaderProfile as HeaderProfileShort } from "@/profile/components";
import { Skeleton } from "@nextui-org/react";
import { writeToLocalStorage } from "@/auth/utils";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import { AuthContext } from "@/auth";
import { CreateLessonModalForm } from "@/app/lessons/components/CreateLessonModalForm";
import { T } from "@/i18n/T";
import Image from "next/image";
import Link from "next/link";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import { TUserAccess } from "@/app/subscription/helpers";
import { headerCtaClassName } from "../Header/styles";

type TProps = {
  isStudent?: boolean;
  access?: TUserAccess;
};

export const useOpenCreateLesson = () => {
  const { setCreateLessonModalIsVisible } = useContext(AuthContext);
  const router = useRouter();

  return useCallback(() => {
    if (window.location.pathname.includes("lesson_plans")) {
      setCreateLessonModalIsVisible(true);
      return;
    }
    writeToLocalStorage("saved_lessons_tab", "userLessons");
    router.push("/lesson_plans");
  }, [router, setCreateLessonModalIsVisible]);
};

export const HeaderProfile = (props: TProps) => {
  const { isStudent, access } = props;
  const { createLessonModalIsVisible, setCreateLessonModalIsVisible } =
    useContext(AuthContext);
  const openCreateLesson = useOpenCreateLesson();

  return (
    <div className="flex flex-row items-center gap-3 max-[374px]:gap-2 md:gap-[15px] lg:gap-2">
      {!isStudent && (
        <div className="hidden md:block">
          {access === "loading" && (
            <Skeleton className="h-[46px] w-[180px] rounded-[14px] lg:h-12" />
          )}
          {access === "noSubscription" && (
            <Link href="/subscription" className={headerCtaClassName}>
              <T k="header.chooseTariff" />
              <Image src={FireButtonIcon} alt="" aria-hidden />
            </Link>
          )}
          {access === "subscribed" && (
            <button
              type="button"
              className={headerCtaClassName}
              onClick={openCreateLesson}
            >
              <T k="lessons.createLesson" />
              <Image src={FireButtonIcon} alt="" aria-hidden />
            </button>
          )}
          {/* <SubscribeCounter /> */}
        </div>
      )}
      <div>
        <HeaderProfileShort isStudent={isStudent} />
        <CreateLessonModalForm
          isVisible={createLessonModalIsVisible}
          onSuccess={() => {
            writeToLocalStorage("saved_lessons_tab", "userLessons");
            window.location.reload();
          }}
          setIsVisible={setCreateLessonModalIsVisible}
        />
      </div>
    </div>
  );
};

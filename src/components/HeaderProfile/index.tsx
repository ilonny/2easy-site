"use client";
import { SubscribeCounter } from "@/subscribe/components";
import { HeaderProfile as HeaderProfileShort } from "@/profile/components";
import { Button } from "@nextui-org/react";
import { writeToLocalStorage } from "@/auth/utils";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import { AuthContext } from "@/auth";
import { CreateLessonModalForm } from "@/app/lessons/components/CreateLessonModalForm";

type TProps = {
  isStudent?: boolean;
};

export const HeaderProfile = (props: TProps) => {
  const { isStudent } = props;
  const { createLessonModalIsVisible, setCreateLessonModalIsVisible } =
    useContext(AuthContext);
  const router = useRouter();

  return (
    <div className="flex flex-row items-center">
      <div className="hidden lg:block">
        {!props.isStudent && (
          <>
            <Button
              color="primary"
              onClick={() => {
                if (window.location.pathname.includes("lesson_plans")) {
                  setCreateLessonModalIsVisible(true);
                  return false;
                }
                writeToLocalStorage("saved_lessons_tab", "userLessons");
                router.push("/lesson_plans");
              }}
            >
              Создать урок
            </Button>
            {/* <SubscribeCounter /> */}
          </>
        )}
      </div>
      <div className="ml-4">
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

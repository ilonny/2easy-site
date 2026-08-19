import { useCallback, useState } from "react";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { TLesson } from "../../types";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";

type TProps = {
  isSkipCreateRealtion?: boolean;
  lesson: TLesson;
  /** В редакторе домашки: та же модалка выбора учеников, другая подпись на кнопке */
  mode?: "start" | "homeworkCheck";
};

export const StartLessonButton = (props: TProps) => {
  const { isSkipCreateRealtion, lesson, mode = "start" } = props;
  const isHomeworkCheck = mode === "homeworkCheck";
  const router = useRouter();
  const { checkSubscription } = useCheckSubscription();
  const [modalVisible, setModalVisible] = useState(false);

  const onSuccess = useCallback(() => {
    router.push(`/lessons/${lesson.id}`);
  }, [lesson?.id, router]);

  const onPressButton = useCallback(() => {
    if (checkSubscription()) {
      if (isSkipCreateRealtion) {
        onSuccess();
        return;
      }
      setModalVisible(true);
    }
  }, [isSkipCreateRealtion, onSuccess, checkSubscription]);

  const label = isHomeworkCheck ? (
    <T k="lessons.checkHomework" defaultText="Check homework" />
  ) : (
    <T k="lessons.startLesson" defaultText="Начать урок" />
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPressButton()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPressButton();
          }
        }}
        className={[
          // Desktop (default): same circle as pre-adaptive
          "z-10 float-right flex cursor-pointer items-center justify-center bg-[#3f28c6] text-center text-white transition-opacity duration-250 hover:opacity-80",
          "sticky top-[80px] mt-[-90px] h-[80px] w-[80px] rounded-full p-2.5",
          "lg:top-10 lg:mt-0 lg:h-[90px] lg:w-[90px]",
          isHomeworkCheck
            ? "px-1 text-[13px] leading-[1.15] lg:text-[15px]"
            : "text-[18px] leading-[22px] lg:text-[22px]",
          // Mobile adaptive only
          "max-lg:float-none max-lg:mb-4 max-lg:mt-0 max-lg:h-12 max-lg:w-full max-lg:rounded-xl max-lg:px-4 max-lg:text-base max-lg:font-medium max-lg:leading-tight max-lg:top-[88px]",
        ].join(" ")}
      >
        <p className="text-center">{label}</p>
      </div>
      {!!lesson && (
        <AttachLessonModalForm
          isVisible={modalVisible}
          setIsVisible={setModalVisible}
          skipChoseStatus
          hideToast
          title={
            isHomeworkCheck ? (
              <T
                k="lessons.chooseStudentToCheckHomework"
                defaultText="Выберите ученика, чтобы проверить homework"
              />
            ) : (
              <T
                k="lessons.chooseStudentsToStart"
                defaultText="Выберите учеников, чтобы начать урок"
              />
            )
          }
          onSuccess={() => {
            setModalVisible(false);
            onSuccess();
          }}
          lesson={lesson}
          confirmLabel={label}
          maxSelection={isHomeworkCheck ? 1 : undefined}
        />
      )}
    </>
  );
};

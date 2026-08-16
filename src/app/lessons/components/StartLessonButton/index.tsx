import { useCallback, useState } from "react";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { TLesson } from "../../types";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";
import { BELOW_SITE_HEADER_STICKY_TOP_CLASS } from "@/constants/uiLayers";

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
          "z-10 flex cursor-pointer touch-manipulation items-center justify-center bg-[#3f28c6] text-center text-white transition-opacity duration-250 hover:opacity-80",
          // Mobile: full-width sticky CTA below fixed header
          `sticky ${BELOW_SITE_HEADER_STICKY_TOP_CLASS} mb-4 mt-0 h-12 w-full rounded-xl px-4 text-base font-medium leading-tight`,
          // Desktop: floating circle (legacy layout)
          "lg:float-right lg:mb-0 lg:mt-[-90px] lg:h-[90px] lg:w-[90px] lg:rounded-full lg:px-2.5 lg:top-10",
          isHomeworkCheck
            ? "text-[13px] sm:text-sm lg:text-[15px] lg:leading-[1.15]"
            : "lg:text-[22px] lg:leading-[22px]",
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
            <T
              k="lessons.chooseStudentsToStart"
              defaultText="Выберите учеников, чтобы начать урок"
            />
          }
          onSuccess={() => {
            setModalVisible(false);
            onSuccess();
          }}
          lesson={lesson}
        />
      )}
    </>
  );
};

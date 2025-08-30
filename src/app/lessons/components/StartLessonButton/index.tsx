import { useCallback, useState } from "react";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { TLesson } from "../../types";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";

type TProps = {
  isSkipCreateRealtion?: boolean;
  lesson: TLesson;
};

export const StartLessonButton = (props: TProps) => {
  const { isSkipCreateRealtion, lesson } = props;
  const router = useRouter();
  const { checkSubscription } = useCheckSubscription();
  const [modalVisible, setModalVisible] = useState(false);

  const onSuccess = useCallback(() => {
    router.push(`/lessons/${lesson.id}`);
  }, [lesson?.id, router]);

  const onPressButton = useCallback(() => {
    if (checkSubscription()) {
      if (!isSkipCreateRealtion) {
        setModalVisible(true);
        return;
      }
      onSuccess();
    }
  }, [isSkipCreateRealtion, onSuccess, checkSubscription]);

  return (
    <>
      <div
        style={{
          borderRadius: 90,
          backgroundColor: "#3f28c6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          lineHeight: "22px",
          color: "#fff",
          cursor: "pointer",
          transition: "all 250ms ease",
          padding: 10,
          position: "sticky",
          zIndex: 10,
          float: "right",
          // marginRight: -150,
        }}
        className="
          hover:opacity-[0.8]
          top-[80px]
          h-[80px]
          w-[80px]
          text-[18px]
          lg:text-[22px]
          lg:h-[90px]
          lg:w-[90px]
          lg:top-[40]
          mt-[-90px]
          lg:mt-0
        "
        onClick={() => onPressButton()}
      >
        <p className="text-center">Начать урок</p>
      </div>
      {!!lesson && (
        <AttachLessonModalForm
          isVisible={modalVisible}
          setIsVisible={setModalVisible}
          skipChoseStatus
          hideToast
          title="Выберите учеников, чтобы начать урок"
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

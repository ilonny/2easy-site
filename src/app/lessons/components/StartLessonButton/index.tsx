import { useCallback, useState } from "react";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { TLesson } from "../../types";
import { useRouter } from "next/navigation";

type TProps = {
  isSkipCreateRealtion?: boolean;
  lesson: TLesson;
};

export const StartLessonButton = (props: TProps) => {
  const { isSkipCreateRealtion, lesson } = props;
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const onSuccess = useCallback(() => {
    router.push(`/lessons/${lesson.id}`);
  }, [lesson.id, router]);

  const onPressButton = useCallback(() => {
    console.log("lesson", lesson);
    if (!isSkipCreateRealtion) {
      setModalVisible(true);
      return;
    }
    onSuccess();
  }, [isSkipCreateRealtion, lesson, onSuccess]);

  return (
    <>
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 90,
          backgroundColor: "#3f28c6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 22,
          lineHeight: "22px",
          color: "#fff",
          cursor: "pointer",
          transition: "all 250ms ease",
          padding: 10,
          position: "sticky",
          top: 40,
          zIndex: 10,
          float: "right",
          marginRight: -150,
        }}
        className="hover:opacity-[0.8]"
        onClick={() => onPressButton()}
      >
        <p>Начать урок</p>
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

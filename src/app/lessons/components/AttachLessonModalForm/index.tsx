import { checkResponse, fetchPostJson } from "@/api";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { TLesson } from "../../types";
import { StudentList } from "@/app/student/components/StudentList";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
};

export const AttachLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lesson,
}) => {
  const [chosenIds, setChosenIds] = useState<number[]>([]);

  const onSubmit = useCallback(async () => {
    const lessonRes = await fetchPostJson({
      path: "/lesson/",
      isSecure: true,
      data: {
        id: lesson.id,
      },
    });
    const lessonResJson = await lessonRes.json();
    if (lessonResJson.success) {
      onSuccess();
      setChosenIds([]);
    }
    checkResponse(lessonResJson);
  }, [onSuccess, lesson]);

  const onClickStudent = useCallback(
    (id: number) => {
      if (chosenIds?.includes(id)) {
        setChosenIds((ids) => ids?.filter((i) => i !== id));
        return;
      }
      setChosenIds((ids) => ids?.concat(id));
    },
    [chosenIds]
  );

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>Выберите учеников, чтобы прикрепить урок</p>
        </ModalHeader>
        <ModalBody>
          <StudentList
            hideAddButton
            hidePopoverButton
            onClickStudent={onClickStudent}
          />
          <Button
            color="primary"
            className="w-full"
            onClick={() => setIsVisible(false)}
          >
            Отменить
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

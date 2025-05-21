import { checkResponse, fetchPostJson } from "@/api";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
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
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"open" | "close">("open");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    const allRes = await Promise.all(
      chosenIds.map(async (student_id) => {
        const res = await fetchPostJson({
          path: "/lesson-relation/create",
          isSecure: true,
          data: {
            lesson_id: lesson.id,
            student_id,
            status,
          },
        });
        return await res.json();
      })
    );
    setIsLoading(false);
    allRes.forEach((res) => {
      checkResponse(res);
    });
    onSuccess();
  }, [chosenIds, lesson.id, onSuccess, status]);

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

  useEffect(() => {
    if (!isVisible) {
      setChosenIds([]);
      setStep(0);
    }
  }, [isVisible]);

  console.log("chosenIds", chosenIds);
  console.log("status", status);
  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader>
          <p>
            {step === 0
              ? "Выберите учеников, чтобы прикрепить урок"
              : "Укажите статус урока"}
          </p>
        </ModalHeader>
        <ModalBody>
          {step === 0 && (
            <>
              <StudentList
                hideAddButton
                hidePopoverButton
                onClickStudent={onClickStudent}
                chosenIds={chosenIds}
              />
              <Button
                disabled={!chosenIds?.length}
                size="lg"
                color={!chosenIds?.length ? "default" : "primary"}
                className="w-full"
                onClick={() => setStep(1)}
              >
                Дальше
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Select
                defaultSelectedKeys={[status]}
                size="lg"
                description={
                  status === "open"
                    ? "Доступен ученику"
                    : "Ученик видит урок, но не может открыть"
                }
                placeholder="Выберите статус урока"
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
              >
                <SelectItem key="open">Урок открыт</SelectItem>
                <SelectItem key="close">Урок закрыт</SelectItem>
              </Select>
              <div className="h-4"></div>
              <Button
                size="lg"
                color="primary"
                className="w-full"
                onClick={onSubmit}
              >
                Прикрепить
              </Button>
              <Button
                isLoading={isLoading}
                size="lg"
                variant="light"
                color="primary"
                className="w-full"
                onClick={() => setStep(0)}
              >
                Назад
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

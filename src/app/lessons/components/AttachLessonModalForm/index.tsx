import { useTranslation } from "react-i18next";
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
import { writeToLocalStorage } from "@/auth/utils";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
  skipChoseStatus?: boolean;
  title?: string;
  hideToast?: boolean;
  isCourses?: boolean;
};

export const AttachLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lesson,
  skipChoseStatus,
  title,
  hideToast,
  isCourses,
}) => {
  const { t } = useTranslation();
  const [chosenIds, setChosenIds] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"open" | "close">("open");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    const allRes = await Promise.all(
      chosenIds.map(async (student_id) => {
        const res = await fetchPostJson({
          path: isCourses
            ? "/course-relation/create"
            : "/lesson-relation/create",
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
    if (!hideToast) {
      allRes.forEach((res) => {
        checkResponse(res);
      });
    }
    try {
      writeToLocalStorage(
        "start_lesson_selected_ids",
        JSON.stringify(chosenIds)
      );
      onSuccess();
    } catch (err) {}
  }, [chosenIds, lesson.id, onSuccess, status, isCourses]);

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

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      style={{ backgroundColor: "#F9F9F9" }}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            {step === 0
              ? title ||
                (isCourses
                  ? t("modals.attachSelectStudentsCourse")
                  : t("modals.attachSelectStudentsLesson"))
              : isCourses
              ? t("modals.attachStatusCourse")
              : t("modals.attachStatusLesson")}
          </p>
        </ModalHeader>
        <ModalBody>
          {step === 0 && (
            <>
              <StudentList
                // hideAddButton
                btnSecondary
                hidePopoverButton
                onClickStudent={onClickStudent}
                chosenIds={chosenIds}
              />
              <Button
                disabled={skipChoseStatus ? false : !chosenIds?.length}
                size="lg"
                color={
                  skipChoseStatus
                    ? "primary"
                    : !chosenIds?.length
                    ? "default"
                    : "primary"
                }
                className="w-full"
                onClick={() => {
                  if (skipChoseStatus) {
                    onSubmit();
                  } else {
                    setStep(1);
                  }
                }}
              >
                {skipChoseStatus ? t("lessons.startLesson") : t("modals.next")}
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
                    ? t("modals.availableToStudent")
                    : isCourses
                    ? t("lessons.studentSeesCourseCannotOpen")
                    : t("lessons.studentSeesLessonCannotOpen")
                }
                placeholder={isCourses ? t("modals.selectCourseStatus") : t("modals.selectLessonStatus")}
                onChange={(e) => {
                  console.log("e.target.value?", e.target.value);
                  setStatus(e.target.value);
                }}
              >
                <SelectItem key="open">
                  {isCourses ? t("lessons.courseOpen") : t("lessons.lessonOpen")}
                </SelectItem>
                <SelectItem key="close">
                  {isCourses ? t("lessons.courseClosed") : t("lessons.lessonClosed")}
                </SelectItem>
              </Select>
              <div className="h-4"></div>
              <Button
                size="lg"
                color="primary"
                className="w-full"
                onClick={onSubmit}
              >
                {t("modals.attachButton")}
              </Button>
              <Button
                isLoading={isLoading}
                size="lg"
                variant="light"
                color="primary"
                className="w-full"
                onClick={() => setStep(0)}
              >
                {t("common.back")}
              </Button>
            </>
          )}
          <div className="h-4"></div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

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
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import type { ReactNode } from "react";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
  skipChoseStatus?: boolean;
  title?: ReactNode;
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
            {step === 0 ? (
              title ?? (
                isCourses ? (
                  <T
                    k="modals.attachSelectStudentsCourse"
                    defaultText="Выберите учеников, чтобы прикрепить курс"
                  />
                ) : (
                  <T
                    k="modals.attachSelectStudentsLesson"
                    defaultText="Выберите учеников, чтобы прикрепить урок"
                  />
                )
              )
            ) : isCourses ? (
              <T
                k="modals.attachStatusCourse"
                defaultText="Выберите статус курса для ученика"
              />
            ) : (
              <T
                k="modals.attachStatusLesson"
                defaultText="Выберите статус урока для ученика"
              />
            )}
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
                {skipChoseStatus ? <T k="lessons.startLesson" /> : <T k="modals.next" />}
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
                    ? i18n.t("modals.availableToStudent", {
                        defaultValue: "Ученик сможет открыть материал",
                      })
                    : isCourses
                    ? i18n.t("lessons.studentSeesCourseCannotOpen", {
                        defaultValue:
                          "Ученик будет видеть курс, но не сможет его открыть",
                      })
                    : i18n.t("lessons.studentSeesLessonCannotOpen", {
                        defaultValue:
                          "Ученик будет видеть урок, но не сможет его открыть",
                      })
                }
                placeholder={
                  isCourses
                    ? i18n.t("modals.selectCourseStatus", {
                        defaultValue: "Выберите статус курса",
                      })
                    : i18n.t("modals.selectLessonStatus", {
                        defaultValue: "Выберите статус урока",
                      })
                }
                onChange={(e) => {
                  console.log("e.target.value?", e.target.value);
                  setStatus(e.target.value);
                }}
              >
                <SelectItem key="open">
                  {isCourses ? <T k="lessons.courseOpen" /> : <T k="lessons.lessonOpen" />}
                </SelectItem>
                <SelectItem key="close">
                  {isCourses ? <T k="lessons.courseClosed" /> : <T k="lessons.lessonClosed" />}
                </SelectItem>
              </Select>
              <div className="h-4"></div>
              <Button
                size="lg"
                color="primary"
                className="w-full"
                onClick={onSubmit}
              >
                <T k="modals.attachButton" />
              </Button>
              <Button
                isLoading={isLoading}
                size="lg"
                variant="light"
                color="primary"
                className="w-full"
                onClick={() => setStep(0)}
              >
                <T k="common.back" />
              </Button>
            </>
          )}
          <div className="h-4"></div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

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
  const isRu = (i18n.language || "").toLowerCase().startsWith("ru");
  const courseOpenText = i18n.t("lessons.courseOpen", {
    defaultValue: isRu ? "Курс открыт" : "The course is open",
  });
  const courseClosedText = i18n.t("lessons.courseClosed", {
    defaultValue: isRu ? "Курс закрыт" : "The course is closed",
  });
  const lessonOpenText = i18n.t("lessons.lessonOpen", {
    defaultValue: isRu ? "Урок открыт" : "The lesson is open",
  });
  const lessonClosedText = i18n.t("lessons.lessonClosed", {
    defaultValue: isRu ? "Урок закрыт" : "The lesson is closed",
  });

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
  }, [chosenIds, lesson.id, onSuccess, status, isCourses, hideToast]);

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
      scrollBehavior="inside"
      placement="center"
      style={{ backgroundColor: "#F9F9F9" }}
      classNames={{
        base: "mx-2 my-4 max-h-[min(900px,90dvh)] sm:mx-auto sm:my-8",
        header: "px-3 pt-4 pb-2 text-base sm:px-6 sm:text-lg",
        body: "px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p className="break-words leading-snug">
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
                className="mt-2 min-h-12 w-full touch-manipulation"
                onClick={() => {
                  if (skipChoseStatus) {
                    onSubmit();
                  } else {
                    setStep(1);
                  }
                }}
              >
                {skipChoseStatus ? (
                  <T k="lessons.startLesson" />
                ) : (
                  <T k="modals.next" />
                )}
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Select
                defaultSelectedKeys={[status]}
                size="lg"
                classNames={{
                  trigger: "min-h-12 touch-manipulation",
                }}
                description={
                  status === "open"
                    ? i18n.t("modals.availableToStudent", {
                        defaultValue: isRu
                          ? "Ученик сможет открыть материал"
                          : "Available to the student",
                      })
                    : isCourses
                      ? i18n.t("lessons.studentSeesCourseCannotOpen", {
                          defaultValue: isRu
                            ? "Ученик будет видеть курс, но не сможет его открыть"
                            : "The student can see the course, but cannot open it",
                        })
                      : i18n.t("lessons.studentSeesLessonCannotOpen", {
                          defaultValue: isRu
                            ? "Ученик будет видеть урок, но не сможет его открыть"
                            : "The student can see the lesson, but cannot open it",
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
                  setStatus(e.target.value as "open" | "close");
                }}
              >
                <SelectItem
                  key="open"
                  textValue={isCourses ? courseOpenText : lessonOpenText}
                >
                  {isCourses ? (
                    <T k="lessons.courseOpen" defaultText="Курс открыт" />
                  ) : (
                    <T k="lessons.lessonOpen" defaultText="Урок открыт" />
                  )}
                </SelectItem>
                <SelectItem
                  key="close"
                  textValue={isCourses ? courseClosedText : lessonClosedText}
                >
                  {isCourses ? (
                    <T k="lessons.courseClosed" defaultText="Курс закрыт" />
                  ) : (
                    <T k="lessons.lessonClosed" defaultText="Урок закрыт" />
                  )}
                </SelectItem>
              </Select>
              <div className="h-4" />
              <Button
                size="lg"
                color="primary"
                className="min-h-12 w-full touch-manipulation"
                onClick={onSubmit}
              >
                <T k="modals.attachButton" />
              </Button>
              <Button
                isLoading={isLoading}
                size="lg"
                variant="light"
                color="primary"
                className="min-h-12 w-full touch-manipulation"
                onClick={() => setStep(0)}
              >
                <T k="common.back" />
              </Button>
            </>
          )}
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

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
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
  skipChoseStatus?: boolean;
  title?: ReactNode;
  hideToast?: boolean;
  isCourses?: boolean;
  confirmLabel?: ReactNode;
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
  confirmLabel,
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
    } catch {
      /* ignore localStorage write errors */
    }
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
      scrollBehavior="outside"
      style={{ backgroundColor: "#F9F9F9" }}
      classNames={{
        backdrop: OVERLAY_ABOVE_HEADER_Z_CLASS,
        wrapper: `${OVERLAY_ABOVE_HEADER_Z_CLASS} max-sm:items-stretch max-sm:p-0`,
        // Fullscreen shell only on mobile
        base: "max-sm:!m-0 max-sm:!my-0 max-sm:!h-[100dvh] max-sm:!max-h-[100dvh] max-sm:!w-full max-sm:!max-w-full max-sm:!rounded-none",
        header:
          "max-sm:px-4 max-sm:pt-[max(1rem,env(safe-area-inset-top))] max-sm:pb-2 max-sm:text-base",
        body: "max-sm:px-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
      }}
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
                className="w-full max-sm:min-h-12 max-sm:touch-manipulation"
                onClick={() => {
                  if (skipChoseStatus) {
                    onSubmit();
                  } else {
                    setStep(1);
                  }
                }}
              >
                {skipChoseStatus ? (
                  confirmLabel ?? <T k="lessons.startLesson" />
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
                  trigger: "max-sm:min-h-12 max-sm:touch-manipulation",
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
                className="w-full max-sm:min-h-12 max-sm:touch-manipulation"
                onClick={onSubmit}
              >
                <T k="modals.attachButton" />
              </Button>
              <Button
                isLoading={isLoading}
                size="lg"
                variant="light"
                color="primary"
                className="w-full max-sm:min-h-12 max-sm:touch-manipulation"
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

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
import { toast } from "react-toastify";
import { relationAttached } from "../../helpers/ensureTeacherLessonCopy";
import {
  studentListFetchParams,
  useCatalogWorkspace,
} from "@/app/school/lib/catalogWorkspace";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (
    chosenIds?: number[],
    sessionId?: number,
    startedLessonId?: number,
  ) => void | Promise<void>;
  lesson: TLesson;
  skipChoseStatus?: boolean;
  title?: ReactNode;
  hideToast?: boolean;
  isCourses?: boolean;
  confirmLabel?: ReactNode;
  /** Для проверки homework — только один ученик */
  maxSelection?: number;
  /** Только выбрать ученика, без lesson_relation (проверка homework) */
  skipCreateRelation?: boolean;
  createLessonSession?: boolean;
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
  maxSelection,
  skipCreateRelation,
  createLessonSession,
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
  const catalogWorkspace = useCatalogWorkspace();
  const workspaceFetch = studentListFetchParams(catalogWorkspace);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      // Always start on the same lesson id (incl. 2easy catalog).
      // Copying would desync teacher/student cabinets.
      const startedLessonId = Number(lesson.id);

      if (!skipCreateRelation) {
        const allRes = await Promise.all(
          chosenIds.map(async (student_id) => {
            const res = await fetchPostJson({
              path: isCourses
                ? "/course-relation/create"
                : "/lesson-relation/create",
              isSecure: true,
              data: {
                lesson_id: startedLessonId,
                student_id,
                status,
              },
              ...workspaceFetch,
            });
            return await res.json();
          }),
        );
        if (!hideToast) {
          allRes.forEach((res) => {
            checkResponse(res);
          });
        } else if (!isCourses) {
          const allOk = allRes.every((res) => relationAttached(res));
          if (!allOk) {
            throw new Error(
              i18n.t("lessons.startLessonAttachFailed", {
                defaultValue: "Не удалось прикрепить учеников к уроку",
              }),
            );
          }
        }
      }

      writeToLocalStorage(
        "start_lesson_selected_ids",
        JSON.stringify(chosenIds),
      );

      let sessionId: number | undefined;
      if (createLessonSession && chosenIds.length) {
        const sessionRes = await fetchPostJson({
          path: "/lesson/session/start",
          isSecure: true,
          data: {
            lesson_id: startedLessonId,
            student_ids: chosenIds,
          },
          ...workspaceFetch,
        });
        const sessionJson = await sessionRes.json();
        if (!sessionJson?.success || !sessionJson?.session?.id) {
          // Still open lesson mode — session is best-effort for isolation.
          console.warn(
            "[start lesson] session failed",
            sessionJson?.message || sessionJson,
          );
        } else {
          sessionId = Number(sessionJson.session.id);
          writeToLocalStorage(
            `lesson_session_${startedLessonId}`,
            String(sessionId),
          );
        }
      }

      await onSuccess(chosenIds, sessionId, startedLessonId);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : i18n.t("commonErrors.somethingWentWrong");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    chosenIds,
    lesson.id,
    onSuccess,
    status,
    isCourses,
    hideToast,
    skipCreateRelation,
    createLessonSession,
    workspaceFetch,
  ]);

  const onClickStudent = useCallback(
    (id: number) => {
      if (chosenIds?.includes(id)) {
        setChosenIds((ids) => ids?.filter((i) => i !== id));
        return;
      }
      if (maxSelection === 1) {
        setChosenIds([id]);
        return;
      }
      setChosenIds((ids) => ids?.concat(id));
    },
    [chosenIds, maxSelection],
  );

  const needsChosenStudent = maxSelection === 1 || !skipChoseStatus;
  const canConfirm = !needsChosenStudent || !!chosenIds.length;

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
      classNames={{
        backdrop: OVERLAY_ABOVE_HEADER_Z_CLASS,
        wrapper: `${OVERLAY_ABOVE_HEADER_Z_CLASS} max-sm:items-stretch max-sm:p-0`,
        base: "bg-white rounded-[20px] lg:rounded-[30px] max-sm:!m-0 max-sm:!my-0 max-sm:!h-[100dvh] max-sm:!max-h-[100dvh] max-sm:!w-full max-sm:!max-w-full max-sm:!rounded-none",
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
                disabled={!canConfirm || isLoading}
                isLoading={isLoading}
                size="lg"
                color={canConfirm ? "primary" : "default"}
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
                isLoading={isLoading}
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

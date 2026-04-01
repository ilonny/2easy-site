/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useTranslation } from "react-i18next";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Image,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { BASE_URL, checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { ExList } from "@/app/editor/components/view/ExList";
import { useExList } from "@/app/editor/hooks/useExList";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  readFromLocalStorage,
  writeToLocalStorage,
} from "@/auth/utils";
import EyeIcon from "@/assets/icons/eye_enable.svg";
import InfoIcon from "@/assets/icons/info.svg";
import CheckedYellow from "@/assets/icons/checked_yellow.svg";
import Tutor2 from "@/assets/images/tutor_2.png";
import Tutor1 from "@/assets/images/tutor_1.png";
import Tutor3 from "@/assets/images/tutor_3.png";
import HeartImage from "@/assets/images/3d-glassy-fuzzy-pink-heart-with-a-happy-face.png";
import { toast } from "react-toastify";
import { Chat } from "@/components/Chat";
import { VideoCall } from "@/components/VideoCall";
import { CopyLessonLink } from "../components/CopyLessonLink";
import { getImageUrl } from "@/app/editor/helpers";

export default function LessonPage() {
  withLogin();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams() as { id: string };
  const { subscription } = (useContext(SibscribeContext as any) as any) || {};
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const { exList, getExList, setExList } = useExList(
    Number(params.id),
    isPresentationMode,
  );
  const { lesson, getLesson } = useLessons();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [students, setStudents] = useState<any[]>([]);
  const [activeStudentId, setActiveStudentId] = useState(0);
  const lastStudentFocusUpdatedAtRef = useRef<number>(0);

  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  const getCurrentExerciseIdInView = useCallback(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return 0;
    }
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[id^="ex-"]'));
    if (!nodes.length) return 0;

    const vh = window.innerHeight || 0;
    let bestId = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const el of nodes) {
      const rect = el.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < vh;
      if (!visible) continue;

      const score = Math.abs(rect.top);
      if (score < bestScore) {
        const idRaw = (el.id || "").replace("ex-", "");
        const idNum = Number(idRaw);
        if (Number.isFinite(idNum) && idNum > 0) {
          bestId = idNum;
          bestScore = score;
        }
      }
    }
    return bestId;
  }, []);

  useEffect(() => {
    const studentIdForLesson =
      isStudent && profile?.studentId
        ? Number(profile.studentId)
        : !isStudent && students?.length === 1
          ? students[0]?.student_id
          : undefined;
    getLesson(params.id as string, studentIdForLesson);
    getExList();
  }, [getExList, getLesson, params.id, isStudent, students, profile?.studentId]);

  const fetchStudents = useCallback(async () => {
    const list = await (
      await fetchGet({
        path: `/lesson-students?lesson_id=${params.id}`,
        isSecure: true,
      })
    )?.json();
    try {
      const selectedIds = JSON.parse(
        readFromLocalStorage("start_lesson_selected_ids") || "",
      )?.map((el: any) => Number(el));
      const filteredIds = selectedIds?.length
        ? list?.studentList?.filter((s: any) => {
            return selectedIds.includes(s.student_id);
          })
        : [];
      setStudents(filteredIds);
      if (filteredIds?.length === 1) {
        setActiveStudentId(filteredIds[0]?.student_id);
      }
    } catch (err) {}
  }, [params.id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!isStudent || isTeacher) return;
    let active = true;
    const lessonId = Number(params.id) || 0;
    if (!lessonId) return;

    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const res = await fetchGet({
          path: `/lesson-focus?lesson_id=${lessonId}`,
          isSecure: true,
        });
        const data = await res?.json();
        const focus = data?.focus;
        const updatedAt = Number(focus?.updated_at_ms || 0);
        const exId = Number(focus?.ex_id || 0);
        if (!updatedAt || !exId) return;
        if (updatedAt === lastStudentFocusUpdatedAtRef.current) return;

        lastStudentFocusUpdatedAtRef.current = updatedAt;
        const el = document.getElementById(`ex-${exId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {}
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isStudent, isTeacher, params.id]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }
    let canGetList = true;
    const getList = async () => {
      if (!canGetList) {
        return;
      }
      const res = await fetchGet({
        path: `/ex/list?lesson_id=${params.id}`,
        isSecure: true,
      });
      const list = await res?.json();
      if (exList.length && list.length && list.length !== exList.length) {
        getExList();
        // setExList(list);
      }

      setTimeout(() => {
        getList();
      }, 1000);
      return list;
    };
    getList();
    return () => {
      canGetList = false;
    };
    // const interval = setInterval(() => {
    //   getExList();
    // }, 1000);
    // return () => clearInterval(interval);
  }, [getExList, isStudent, params.id, exList, setExList]);

  useEffect(() => {
    if (!tutorialOpen) {
      setTutorialStep(1);
    }
  }, [tutorialOpen]);

  const onChangePresentationMode = useCallback((e: any) => {
    e.stopPropagation();
    setIsPresentationMode((s) => !s);
  }, []);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-8 sm:h-10 md:h-14" />
          {isTeacher && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 w-full min-w-0">
              <Link href={`/editor/${params.id}`} className="text-secondary shrink-0">
                <Button variant="light" className="min-w-0">
                  {t("lessons.backToEdit")}
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 min-w-0 w-full sm:w-auto sm:justify-end">
                <div
                  className="switcher flex items-center cursor-pointer"
                  onClick={onChangePresentationMode}
                >
                  <p className="text-small mr-2">{t("lessons.screenDemoMode")}</p>
                  <Switch
                    size="sm"
                    isSelected={isPresentationMode}
                    style={{ pointerEvents: "none" }}
                  />
                </div>
                <Button
                  endContent={<img src={InfoIcon.src} alt="icon" />}
                  variant="light"
                  onClick={() => {
                    setTutorialOpen(true);
                    setTutorialStep(4);
                  }}
                  isIconOnly
                />
                <Button
                  endContent={<img src={InfoIcon.src} alt="icon" />}
                  variant="light"
                  onClick={() => setTutorialOpen(true)}
                >
                  {t("lessons.howLessonModeWorks")}
                </Button>
                <CopyLessonLink />
              </div>
            </div>
          )}
        </div>
        <div className="h-6 sm:h-8 md:h-10" />
        <div className="h-4 sm:h-6 md:h-10" />
        <div className="flex flex-row items-stretch gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="p-3 sm:p-5 md:p-8 lg:p-10 w-full max-w-[1160px] mx-auto bg-white rounded-[10px] box-border min-w-0"
              style={{
                marginLeft: isStudent ? "auto" : undefined,
                marginRight: isStudent ? "auto" : undefined,
              }}
            >
              <h1 className="text-center text-[26px] sm:text-[32px] md:text-[38px] lg:text-[44px] leading-tight text-primary font-bold px-1 break-words">
                {lesson?.title}
              </h1>
              {!!lesson?.description && (
                <h2 className="text-center text-base sm:text-lg md:text-xl font-medium max-w-[800px] mx-auto whitespace-pre-line px-2 mt-3 sm:mt-4">
                  {lesson?.description}
                </h2>
              )}
              <div className="h-6 sm:h-8" />
              {!!lesson?.image_path && (
                <div className="w-full max-w-full min-w-0 mb-8 sm:mb-12 md:mb-14">
                  <Zoom>
                    <img
                      src={getImageUrl(lesson.image_path)}
                      className="block max-w-full h-auto max-h-[min(55vh,400px)] object-contain mx-auto"
                      alt="image lesson"
                    />
                  </Zoom>
                </div>
              )}
              <div className="h-4 sm:h-8" />
              <div key={exList.length}>
                <ExList
                  list={exList}
                  isView
                  activeStudentId={activeStudentId}
                  key={exList.length}
                  is2easy={lesson?.user_id === 1}
                  isAdmin={profile?.role_id === 1}
                  isPresentationMode={isPresentationMode}
                  onPressCreate={() => {}}
                  onSuccessCreate={() => {}}
                  onPressDelete={() => {}}
                  onPressEdit={() => {}}
                  changeSortIndex={async () => {}}
                  onChangeIsVisible={() => {}}
                />
              </div>
              {!!lesson?.homework_lesson_id &&
                !lesson?.lesson_id_homework && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      color="primary"
                      size="lg"
                      onClick={async () => {
                        if (
                          !isStudent &&
                          students?.length === 1 &&
                          students[0]?.student_id
                        ) {
                          const res = await fetchPostJson({
                            path: "/lessons/homework/get-or-create-for-student",
                            isSecure: true,
                            data: {
                              lesson_id: params.id,
                              student_id: students[0].student_id,
                            },
                          });
                          const data = await res?.json();
                          if (data?.homework_lesson_id) {
                            writeToLocalStorage(
                              "start_lesson_selected_ids",
                              JSON.stringify([students[0].student_id])
                            );
                            router.push(
                              `/lessons/${data.homework_lesson_id}`
                            );
                            return;
                          }
                        }
                        if (isStudent && profile?.studentId) {
                          const res = await fetchPostJson({
                            path: "/lessons/homework/create-my",
                            isSecure: true,
                            data: {
                              lesson_id: params.id,
                              student_id: profile.studentId,
                            },
                          });
                          const data = await res?.json();
                          checkResponse(data);
                          if (data?.homework_lesson_id) {
                            writeToLocalStorage(
                              "start_lesson_selected_ids",
                              JSON.stringify([profile.studentId])
                            );
                            router.push(
                              `/lessons/${data.homework_lesson_id}`
                            );
                            return;
                          }
                        }
                        if (isStudent && profile?.studentId) {
                          writeToLocalStorage(
                            "start_lesson_selected_ids",
                            JSON.stringify([profile.studentId])
                          );
                        }
                        router.push(
                          `/lessons/${lesson.homework_lesson_id}`
                        );
                      }}
                    >
                      Homework
                    </Button>
                  </div>
                )}
            </div>
          </div>
          {!isStudent && !!students?.length && (
            <aside
              className="flex w-[64px] shrink-0 min-w-0 flex-col self-stretch sm:w-[100px] md:w-[180px] lg:w-[200px]"
              aria-label="Участники урока"
            >
              <div className="sticky top-[88px] w-full lg:top-8">
                <div
                  className="max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] lg:max-h-[calc(100dvh-2rem)]"
                >
                <div className="mb-1.5 sm:mb-3 md:mb-7">
                  <p className="text-center text-[7px] font-bold uppercase leading-tight text-[#231F20] sm:text-[9px] md:text-left md:text-sm">
                    <span className="md:hidden">Участн.</span>
                    <span className="hidden md:inline">УЧАСТНИКИ</span>
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 md:gap-3">
                  {students?.map((s) => {
                    const isActive = s?.student_id === activeStudentId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveStudentId(s.student_id)}
                        className="cursor-pointer min-w-0"
                      >
                        <Card
                          className="w-full min-w-0 p-1 sm:p-2 md:p-4"
                          shadow="none"
                          style={{
                            backgroundColor: isActive ? "#EEEBFF" : "#fff",
                          }}
                        >
                          <p className="text-[8px] font-bold uppercase leading-snug text-[#231F20] break-words line-clamp-4 sm:text-[10px] md:text-sm md:line-clamp-none">
                            {s["student.name"]}
                          </p>
                          {!!s["student.email"] && (
                            <p className="mt-0.5 hidden text-[#767676] break-all md:mt-1 md:block md:text-sm">
                              {s["student.email"]}
                            </p>
                          )}
                        </Card>
                      </div>
                    );
                  })}
                </div>
                {isTeacher && (
                  <div className="mt-2 flex flex-col items-stretch gap-1.5 sm:mt-3 sm:flex-row sm:items-center sm:gap-2 md:mt-4">
                    <Button
                      variant="flat"
                      color="default"
                      className="min-h-0 w-full flex-1 px-0.5 py-1.5 text-[8px] leading-tight sm:min-h-[36px] sm:px-2 sm:py-2 sm:text-[10px] md:min-h-[44px] md:px-3 md:text-xs"
                      size="sm"
                      style={{
                        justifyContent: "center",
                        whiteSpace: "normal",
                        height: "auto",
                        minHeight: 0,
                        lineHeight: "120%",
                        textAlign: "center",
                        backgroundColor: "#F3F4F6",
                        color: "#111827",
                        border: "1px solid rgba(17,24,39,0.12)",
                      }}
                      onClick={async () => {
                        const lessonId = Number(params.id) || 0;
                        const exId = getCurrentExerciseIdInView();
                        if (!lessonId || !exId) {
                          toast(t("lessons.focusScroll.cantDetectCurrentTask"), {
                            type: "error",
                          });
                          return;
                        }
                        try {
                          const res = await fetchPostJson({
                            path: "/lesson-focus",
                            isSecure: true,
                            data: { lesson_id: lessonId, ex_id: exId },
                          });
                          const data = await res?.json();
                          checkResponse(data, true);
                        } catch (err) {}
                      }}
                    >
                      {t("lessons.focusScroll.button")}
                    </Button>
                    <ResponsiveTooltip
                      content={
                        <div
                          style={{
                            maxWidth: 320,
                            whiteSpace: "normal",
                            lineHeight: "140%",
                          }}
                        >
                          {t("lessons.focusScroll.tooltip")}
                        </div>
                      }
                      placement="left"
                      closeDelay={0}
                    >
                      <div
                        role="button"
                        aria-label="help"
                        tabIndex={0}
                        className="shrink-0 mx-auto flex h-7 w-7 items-center justify-center rounded-full sm:mx-0 sm:h-[34px] sm:w-[34px]"
                        style={{
                          background: "rgba(63,40,198,0.06)",
                          border: "1px solid rgba(63,40,198,0.14)",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <img
                          src={InfoIcon.src}
                          alt="info"
                          style={{ width: 16, height: 16, opacity: 0.9 }}
                        />
                      </div>
                    </ResponsiveTooltip>
                  </div>
                )}
                </div>
              </div>
            </aside>
          )}
        </div>
        <div className="relative">
          <div
            className="fixed right-2 bottom-3 sm:right-4 sm:bottom-4 flex flex-col items-end gap-2 max-w-[calc(100vw-1rem)] z-10"
          >
            <VideoCall lessonId={params.id as string} />
            <Chat
              students={students as any}
              lesson_id={Number(params.id) || lesson?.id || 0}
              isTeacher={isTeacher}
            />
          </div>
        </div>
        <div className="h-20"></div>
      </ContentWrapper>
      <Modal
        size="xl"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        style={{ background: "#fff  " }}
        className=" relative"
      >
        <ModalContent>
          <ModalHeader className="justify-center"></ModalHeader>
          <ModalBody style={{ minHeight: 460 }}>
            {tutorialStep === 1 && (
              <>
                <div className="h-14"></div>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Сейчас вы находитесь в режиме урока
                </p>
                <p className="text-center mb-2">
                  Пролистайте небольшой туториал, который
                  <br />
                  расскажет, что можно делать в этом режиме
                </p>
                <div
                  style={{
                    backgroundColor: "#F0EEFF",
                    padding: 12,
                    borderRadius: 10,
                    margin: "auto",
                    maxWidth: 350,
                    width: "100%",
                  }}
                >
                  <p className="text-primary text-center">
                    Время на изучение ~ 1 минута
                  </p>
                  <p className="text-primary text-center">
                    Польза в работе + 110%
                  </p>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(2)}
                >
                  <p>{t("lessons.flipNext")}</p>
                </Button>
                <div
                  style={{
                    width: 175,
                    position: "absolute",
                    top: 0,
                    right: 0,
                    zIndex: -1,
                  }}
                >
                  <Image src={HeartImage.src} alt="heart image" />
                </div>
              </>
            )}
            {tutorialStep === 2 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Чтобы начать урок, нужно
                  <br />
                  поделиться им с учеником
                </p>
                <p className="text-center mb-2">
                  Сделать это можно двумя способами:
                </p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      попросить ученика зайти в нужный урок в своем личном
                      кабинете
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>{t("lessons.sendLessonLink")}</p>
                  </div>
                  <div className="h-8"></div>
                  <div className="flex justify-end">
                    <div style={{ marginRight: -30 }}>
                      <CopyLessonLink />
                    </div>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(3)}
                >
                  <p>{t("lessons.next")}</p>
                </Button>
              </>
            )}
            {tutorialStep === 3 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Когда ученик присоединился к уроку,
                  <br />
                  вы можете:
                </p>
                <p className="text-center mb-2"></p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>{t("lessons.seeRealtimeAnswers")}</p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      менять видимость заданий прямо на уроке с помощью{" "}
                      <img
                        src={EyeIcon.src}
                        style={{ display: "inline", margin: "0 5px" }}
                      />{" "}
                      слева от задания
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      {t("lessons.lessonChatNotes")}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px] opacity-0">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p style={{ color: "#ACACAC", fontSize: 12 }}>
                      {t("lessons.lessonChatHistory")}
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(4)}
                >
                  <p>{t("lessons.next")}</p>
                </Button>
              </>
            )}
            {tutorialStep === 4 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Если ведете урок с помощью
                  <br />
                  демонстрации экрана или офлайн:
                </p>
                <p className="text-center mb-2"></p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      включите опцию “Режим демонстрации экрана”. Она позволит
                      скрыть правильные ответы, подсказки и блоки, которые вы
                      сделали невидимыми для ученика.
                      <br />
                      <br />
                      По сути, вы будете видеть урок так, как видел бы его
                      ученик в своем личном кабинете.
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(5)}
                >
                  <p>{t("lessons.next")}</p>
                </Button>
              </>
            )}
            {tutorialStep === 5 && (
              <>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Если вы ведете групповой урок:
                    </p>
                    <p></p>
                    <div className="h-2"></div>
                    <div style={{ maxWidth: 500, margin: "auto" }}>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="shrink-0 pt-[3px]">
                          <Image src={CheckedYellow.src} alt="checked" />
                        </div>
                        <p>
                          если занятие групповое, вы можете переключаться между
                          учениками на панели справа, чтобы увидеть ответы
                          каждого* из них
                        </p>
                      </div>
                      <div className="flex items-start justify-between flex-wrap">
                        <div className="flex items-start gap-2 mb-2 pt-4">
                          <div className="shrink-0 pt-[3px] opacity-0">
                            <Image src={CheckedYellow.src} alt="checked" />
                          </div>
                          <p style={{ color: "#3F28C6", fontSize: 12 }}>
                            *Светло-фиолетовым отмечен ученик,
                            <br />
                            ответы которого отображаются на экране
                          </p>
                        </div>
                        <img src={Tutor2.src} style={{ width: 183 }} />
                      </div>
                      {/* <div className="h-6"></div> */}
                    </div>
                  </div>
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onClick={() => setTutorialStep(6)}
                  >
                    <p>{t("lessons.next")}</p>
                  </Button>
                </div>

                <img
                  src={Tutor1.src}
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    zIndex: -1,
                    width: 370,
                  }}
                />
              </>
            )}
            {tutorialStep === 6 && (
              <>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      После завершения урока
                    </p>
                    <p className="text-center">
                      Все ответы ученика сохраняются.
                      <br />
                      Посмотреть ответы после завершения урока вы можете,
                      <br />
                      перейдя в личный кабинет ученика и выбрав нужный урок
                    </p>
                    <div className="h-4"></div>
                  </div>
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onClick={() => setTutorialOpen(false)}
                  >
                    <p>{t("lessons.letsWork")}</p>
                  </Button>
                </div>

                <img
                  src={Tutor3.src}
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    zIndex: -1,
                    width: 500,
                  }}
                />
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="w-[100px]">
                {tutorialStep >= 2 && (
                  <div
                    style={{
                      fontSize: 14,
                      color:
                        tutorialStep === 5 || tutorialStep === 6
                          ? "#fff"
                          : "#B7B7B7",
                    }}
                    className="cursor-pointer hover:underline"
                    onClick={() => setTutorialStep((s) => s - 1)}
                  >
                    ← назад
                  </div>
                )}
              </div>
              <p
                className="text-center"
                style={{
                  fontSize: 14,
                  color:
                    tutorialStep === 5 || tutorialStep === 6
                      ? "#fff"
                      : "#B7B7B7",
                }}
              >
                {tutorialStep} / 6
              </p>
              <div className="w-[100px]"></div>
            </div>
            <div className="h-2"></div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}

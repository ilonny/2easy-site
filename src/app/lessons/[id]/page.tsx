/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Button,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Switch,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLessons } from "@/app/lessons/hooks/useLessons";
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
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { LessonDictionaryButton } from "@/app/dictionary/components/DictionaryButtons";
import { DICTIONARY_ONBOARDING_STORAGE_KEY } from "@/app/dictionary/constants";
import { DictionarySelectionWidget } from "@/app/dictionary/components/DictionarySelectionWidget";
import { DictionaryOnboardingModal } from "@/app/dictionary/components/DictionaryOnboardingModal";
import {
  LessonDictionaryHandle,
  LessonDictionaryLayer,
} from "@/app/dictionary/components/LessonDictionaryLayer";
import dynamic from "next/dynamic";
import { parseRouteId, parseRouteIdNumber } from "@/utils/parseRouteId";
import { LessonParticipantsPanel } from "@/app/lessons/components/LessonParticipantsPanel";
import type { TLessonParticipant } from "@/app/lessons/components/LessonParticipantsPanel";
import { LessonFloatingTools } from "@/app/lessons/components/LessonFloatingTools";
import { LessonToolTrigger } from "@/app/lessons/components/LessonToolTrigger";
import { BELOW_SITE_HEADER_STICKY_TOP_CLASS } from "@/constants/uiLayers";
import { useRedirectIfLessonLockedOnTrial } from "@/app/subscription/helpers";

const ParticipantsIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LessonBoardButton = dynamic(
  () =>
    import("@/app/board/components/LessonBoardButton").then(
      (mod) => mod.LessonBoardButton,
    ),
  { ssr: false },
);

const VIEW_NOOP = () => {};
const VIEW_ASYNC_NOOP = async () => {};

export default function LessonPage() {
  withLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams() as { id: string };
  const lessonId = parseRouteId(params.id);
  const lessonIdNum = parseRouteIdNumber(params.id);
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const { exList, getExList, setExList } = useExList(
    lessonIdNum ?? undefined,
    isPresentationMode,
  );
  const { lesson, getLesson } = useLessons();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [students, setStudents] = useState<TLessonParticipant[]>([]);
  const [activeStudentId, setActiveStudentId] = useState(0);
  const [lessonSessionId, setLessonSessionId] = useState<number | undefined>(
    () => Number(searchParams?.get("session_id") || 0) || undefined,
  );
  const [lessonSessionRoster, setLessonSessionRoster] = useState<number[]>([]);
  const lastStudentFocusUpdatedAtRef = useRef<number>(0);

  const [dictionaryOnboardingOpen, setDictionaryOnboardingOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const dictionaryRef = useRef<LessonDictionaryHandle>(null);
  const boardModalOpenRef = useRef(false);

  boardModalOpenRef.current = boardModalOpen;

  useEffect(() => {
    if (authIsLoading || !lessonIdNum) return;
    let cancelled = false;
    const requested = Number(searchParams?.get("session_id") || 0);
    void (async () => {
      try {
        const query = new URLSearchParams({
          lesson_id: String(lessonIdNum),
        });
        if (requested) query.set("session_id", String(requested));
        const res = await fetchGet({
          path: `/lesson/session/resolve?${query.toString()}`,
          isSecure: true,
        });
        const json = await res?.json();
        if (!cancelled && json?.success && json?.session?.id) {
          setLessonSessionId(Number(json.session.id));
          const roster = Array.isArray(json.session.student_ids)
            ? json.session.student_ids.map(Number).filter(Boolean)
            : [];
          if (roster.length) {
            setLessonSessionRoster(roster);
            writeToLocalStorage(
              "start_lesson_selected_ids",
              JSON.stringify(roster),
            );
          }
        }
      } catch {
        // Legacy lessons without a persisted session keep old per-student scope.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authIsLoading, lessonIdNum, searchParams]);

  const handleAddWordSelection = useCallback(
    (selection: string) => {
      if (isTeacher) {
        if (!students?.length) {
          toast(i18n.t("dictionary.noStudentsOnLesson"), { type: "warning" });
          return;
        }

        dictionaryRef.current?.openAddWordForLesson(selection);
        return;
      }

      dictionaryRef.current?.openAddWord(selection);
    },
    [isTeacher, students?.length]
  );

  const handleOpenStudentDictionary = useCallback(() => {
    if (profile?.studentId) {
      dictionaryRef.current?.openDictionary(Number(profile.studentId));
    }
  }, [profile?.studentId]);

  const lessonBoardStudentId = isStudent
    ? Number(profile?.studentId || 0) || undefined
    : students?.length === 1
      ? Number(students[0]?.student_id || 0) || undefined
      : activeStudentId
        ? Number(activeStudentId)
        : undefined;

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
    if (!lessonId) return;
    const studentIdForLesson =
      isStudent && profile?.studentId
        ? Number(profile.studentId)
        : !isStudent && students?.length === 1
          ? students[0]?.student_id
          : undefined;
    getLesson(lessonId, studentIdForLesson);
    getExList();
  }, [getExList, getLesson, lessonId, isStudent, students, profile?.studentId]);

  const fetchStudents = useCallback(async () => {
    if (!lessonId) return;
    let selectedIds: number[] = lessonSessionRoster;
    if (!selectedIds.length) {
      try {
        selectedIds = (
          JSON.parse(readFromLocalStorage("start_lesson_selected_ids") || "[]") as unknown[]
        )
          ?.map((el) => Number(el))
          ?.filter((n) => Number(n) > 0);
      } catch {
        /* ignore */
      }
    }

    const paramsQs = new URLSearchParams();
    paramsQs.set("lesson_id", lessonId);
    if (selectedIds?.length) {
      paramsQs.set("student_ids", selectedIds.join(","));
    }
    const list = await (
      await fetchGet({
        path: `/lesson-students?${paramsQs.toString()}`,
        isSecure: true,
      })
    )?.json();
    try {
      const filteredIds = selectedIds?.length
        ? (list?.studentList as TLessonParticipant[] | undefined)?.filter((s) => {
            return selectedIds.includes(s.student_id);
          })
        : [];
      setStudents(filteredIds || []);
      if (filteredIds?.length === 1) {
        setActiveStudentId(filteredIds[0]?.student_id);
      }
    } catch {
      /* ignore */
    }
  }, [lessonId, lessonSessionRoster]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!isStudent || isTeacher) return;
    let active = true;
    if (!lessonIdNum) return;

    const interval = setInterval(async () => {
      if (!active || boardModalOpenRef.current) return;
      try {
        const res = await fetchGet({
          path: `/lesson-focus?lesson_id=${lessonIdNum}`,
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
      } catch {
      /* ignore */
    }
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isStudent, isTeacher, lessonIdNum]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }
    let canGetList = true;
    const getList = async () => {
      if (!canGetList || boardModalOpenRef.current) {
        if (canGetList) {
          setTimeout(() => {
            getList();
          }, 4000);
        }
        return;
      }
      if (!lessonId) return;
      const res = await fetchGet({
        path: `/ex/list?lesson_id=${lessonId}`,
        isSecure: true,
      });
      const list = await res?.json();
      if (exList.length && list.length && list.length !== exList.length) {
        getExList();
        // setExList(list);
      }

      setTimeout(() => {
        getList();
      }, 4000);
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
  }, [getExList, isStudent, lessonId, exList, setExList]);

  useEffect(() => {
    if (authIsLoading || !profile) {
      return;
    }

    const hasSeenOnboarding = readFromLocalStorage(
      DICTIONARY_ONBOARDING_STORAGE_KEY
    );

    if (!hasSeenOnboarding) {
      setDictionaryOnboardingOpen(true);
    }
  }, [authIsLoading, profile]);

  const handleDictionaryOnboardingComplete = useCallback(() => {
    writeToLocalStorage(DICTIONARY_ONBOARDING_STORAGE_KEY, "1");
    setDictionaryOnboardingOpen(false);
  }, []);

  useEffect(() => {
    if (!tutorialOpen) {
      setTutorialStep(1);
    }
  }, [tutorialOpen]);

  const onChangePresentationMode = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      setIsPresentationMode((s) => !s);
    },
    [],
  );

  const showParticipants = !isStudent && !!students?.length;

  const handleFocusScroll = useCallback(async () => {
    const lessonId = Number(params.id) || 0;
    const exId = getCurrentExerciseIdInView();
    if (!lessonId || !exId) {
      toast(i18n.t("lessons.focusScroll.cantDetectCurrentTask"), {
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
    } catch {
      /* ignore */
    }
  }, [getCurrentExerciseIdInView, params.id]);

  const handleOpenParticipantDictionary = useCallback((studentId: number) => {
    dictionaryRef.current?.openDictionary(studentId);
    setParticipantsOpen(false);
  }, []);

  const isLockedOnTrial = useRedirectIfLessonLockedOnTrial(lesson);

  if (isLockedOnTrial) {
    return null;
  }

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-full min-w-0">
          <div className="h-3 sm:h-6 md:h-10" />
          {isTeacher && (
            <div className="flex w-full min-w-0 flex-col gap-1.5 md:flex-row md:items-start md:justify-between md:gap-4">
              <Link
                href={`/editor/${params.id}`}
                className="w-fit shrink-0 text-secondary"
              >
                <Button
                  variant="light"
                  className="min-h-10 min-w-0 touch-manipulation px-2"
                >
                  <T k="lessons.backToEdit" />
                </Button>
              </Link>
              <div className="flex w-full flex-col items-center gap-1.5 md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-2">
                <div
                  className="switcher flex min-h-10 w-fit max-w-full cursor-pointer touch-manipulation items-center justify-center gap-2 md:justify-start"
                  onClick={onChangePresentationMode}
                >
                  <p className="text-small">
                    <T k="lessons.screenDemoMode" />
                  </p>
                  <Switch
                    size="sm"
                    isSelected={isPresentationMode}
                    style={{ pointerEvents: "none" }}
                  />
                  <Button
                    endContent={<img src={InfoIcon.src} alt="icon" />}
                    variant="light"
                    className="min-h-9 min-w-9 touch-manipulation"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTutorialOpen(true);
                      setTutorialStep(4);
                    }}
                    isIconOnly
                  />
                </div>
                <Button
                  endContent={<img src={InfoIcon.src} alt="icon" />}
                  variant="light"
                  className="h-auto min-h-10 w-fit max-w-full touch-manipulation justify-center whitespace-normal px-2 py-1.5 text-center md:justify-start md:text-left"
                  onClick={() => setTutorialOpen(true)}
                >
                  <T k="lessons.howLessonModeWorks" />
                </Button>
                <div className="flex w-full max-w-full justify-center md:w-auto md:justify-end">
                  <CopyLessonLink />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-3 sm:h-6 md:h-10" />
        <div className="h-2 sm:h-4 md:h-10" />
        <div className="flex flex-row items-stretch gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div
              className="p-3 sm:p-5 md:p-8 lg:p-10 w-full max-w-[1160px] mx-auto bg-white rounded-[10px] box-border min-w-0 relative"
              id="lessonContentWrapper"
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
                  onPressCreate={VIEW_NOOP}
                  onSuccessCreate={VIEW_NOOP}
                  onPressDelete={VIEW_NOOP}
                  onPressEdit={VIEW_NOOP}
                  changeSortIndex={VIEW_ASYNC_NOOP}
                  onChangeIsVisible={VIEW_NOOP}
                />
              </div>
              {((isStudent && profile?.studentId) ||
                (isTeacher && !!students?.length)) && (
                <DictionarySelectionWidget
                  wrapperId="lessonContentWrapper"
                  onAddSelection={handleAddWordSelection}
                />
              )}
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
                          const saveSelectedAndNavigate = (hwId: number) => {
                            writeToLocalStorage(
                              "start_lesson_selected_ids",
                              JSON.stringify([profile.studentId])
                            );
                            router.push(`/lessons/${hwId}`);
                          };
                          // Same as LessonCard: prefer resolved individual HW
                          if (
                            lesson.has_individual_homework &&
                            lesson.homework_lesson_id
                          ) {
                            saveSelectedAndNavigate(
                              Number(lesson.homework_lesson_id)
                            );
                            return;
                          }
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
                            saveSelectedAndNavigate(data.homework_lesson_id);
                            return;
                          }
                          saveSelectedAndNavigate(
                            Number(lesson.homework_lesson_id)
                          );
                          return;
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
              className="hidden md:flex w-[180px] shrink-0 min-w-0 flex-col self-stretch lg:w-[200px]"
              aria-label={i18n.t("lessons.participantsAriaLabel")}
            >
              <div className={`sticky ${BELOW_SITE_HEADER_STICKY_TOP_CLASS} w-full lg:top-8`}>
                <LessonParticipantsPanel
                  students={students}
                  activeStudentId={activeStudentId}
                  isTeacher={isTeacher}
                  onSelectStudent={setActiveStudentId}
                  onOpenDictionary={handleOpenParticipantDictionary}
                  onFocusScroll={handleFocusScroll}
                />
              </div>
            </aside>
          )}
        </div>
        <div className="relative">
          <LessonFloatingTools>
            {showParticipants && (
              <LessonToolTrigger
                mobileOnly
                label={
                  <>
                    {i18n.t("lessons.participantsButton")}
                    {students.length > 0 ? ` (${students.length})` : ""}
                  </>
                }
                ariaLabel={`${i18n.t("lessons.participantsButton")}${
                  students.length > 0 ? ` (${students.length})` : ""
                }`}
                icon={<ParticipantsIcon />}
                onClick={() => setParticipantsOpen(true)}
              />
            )}
            {isStudent && profile?.studentId && (
              <LessonDictionaryButton onClick={handleOpenStudentDictionary} />
            )}
            <LessonBoardButton
              lessonId={Number(params.id) || lesson?.id || 0}
              isTeacher={isTeacher}
              studentIdForBoard={lessonBoardStudentId}
              lessonSessionId={lessonSessionId}
              onOpenChange={setBoardModalOpen}
            />
            <VideoCall lessonId={params.id as string} />
            <Chat
              lesson_id={Number(params.id) || lesson?.id || 0}
              studentId={lessonBoardStudentId}
              lessonSessionId={lessonSessionId}
              isTeacher={isTeacher}
            />
          </LessonFloatingTools>
        </div>
        <div className="h-16" />
      </ContentWrapper>
      {showParticipants && (
        <Modal
          isOpen={participantsOpen}
          onClose={() => setParticipantsOpen(false)}
          placement="bottom"
          scrollBehavior="inside"
          classNames={{
            base: "md:!hidden m-0 sm:m-0 max-h-[85dvh] rounded-b-none rounded-t-2xl",
            wrapper: "md:!hidden items-end",
            body: "px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2",
            header: "px-4 pb-1 pt-4",
          }}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <T k="lessons.participants" defaultText="УЧАСТНИКИ" />
            </ModalHeader>
            <ModalBody>
              <LessonParticipantsPanel
                compact
                students={students}
                activeStudentId={activeStudentId}
                isTeacher={isTeacher}
                onSelectStudent={(id) => {
                  setActiveStudentId(id);
                  setParticipantsOpen(false);
                }}
                onOpenDictionary={handleOpenParticipantDictionary}
                onFocusScroll={() => {
                  void handleFocusScroll();
                  setParticipantsOpen(false);
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <Modal
        size="xl"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        scrollBehavior="inside"
        style={{ background: "#fff" }}
        classNames={{
          base: "mx-2 my-4 max-h-[min(900px,92dvh)] sm:mx-auto",
          body: "relative px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6",
          header: "px-3 sm:px-6",
        }}
        className="relative"
      >
        <ModalContent>
          <ModalHeader className="justify-center"></ModalHeader>
          <ModalBody className="min-h-0 sm:min-h-[420px]">
            {tutorialStep === 1 && (
              <>
                <div className="hidden h-14 sm:block"></div>
                <p className="text-center text-lg font-medium sm:text-[22px]">
                  Сейчас вы находитесь в режиме урока
                </p>
                <p className="mb-2 text-center text-sm sm:text-base">
                  Пролистайте небольшой туториал, который
                  <br className="hidden sm:block" />
                  {" "}расскажет, что можно делать в этом режиме
                </p>
                <div className="mx-auto w-full max-w-[350px] rounded-[10px] bg-[#F0EEFF] p-3">
                  <p className="text-center text-primary">
                    Время на изучение ~ 1 минута
                  </p>
                  <p className="text-center text-primary">
                    Польза в работе + 110%
                  </p>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="min-h-12 w-full touch-manipulation"
                  size="lg"
                  onClick={() => setTutorialStep(2)}
                >
                  <p><T k="lessons.flipNext" /></p>
                </Button>
                <div className="pointer-events-none absolute right-0 top-0 z-[-1] hidden w-[140px] sm:block sm:w-[175px]">
                  <Image src={HeartImage.src} alt="heart image" />
                </div>
              </>
            )}
            {tutorialStep === 2 && (
              <>
                <p className="text-center text-lg font-medium sm:text-[22px]">
                  Чтобы начать урок, нужно
                  <br className="hidden sm:block" />
                  {" "}поделиться им с учеником
                </p>
                <p className="mb-2 text-center text-sm sm:text-base">
                  Сделать это можно двумя способами:
                </p>
                <div className="mx-auto w-full max-w-[500px]">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base">
                      попросить ученика зайти в нужный урок в своем личном
                      кабинете
                    </p>
                  </div>
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base"><T k="lessons.sendLessonLink" /></p>
                  </div>
                  <div className="h-6 sm:h-8"></div>
                  <div className="flex justify-end">
                    <div className="sm:-mr-[30px]">
                      <CopyLessonLink />
                    </div>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="min-h-12 w-full touch-manipulation"
                  size="lg"
                  onClick={() => setTutorialStep(3)}
                >
                  <p><T k="lessons.next" /></p>
                </Button>
              </>
            )}
            {tutorialStep === 3 && (
              <>
                <p className="text-center text-lg font-medium sm:text-[22px]">
                  Когда ученик присоединился к уроку,
                  <br className="hidden sm:block" />
                  {" "}вы можете:
                </p>
                <p className="mb-2 text-center"></p>
                <div className="mx-auto w-full max-w-[500px]">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base"><T k="lessons.seeRealtimeAnswers" /></p>
                  </div>
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base">
                      менять видимость заданий прямо на уроке с помощью{" "}
                      <img
                        src={EyeIcon.src}
                        className="mx-1 inline"
                        alt=""
                      />{" "}
                      слева от задания
                    </p>
                  </div>
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base">
                      <T k="lessons.lessonChatNotes" />
                    </p>
                  </div>
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px] opacity-0">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-xs text-[#ACACAC]">
                      <T k="lessons.lessonChatHistory" />
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="min-h-12 w-full touch-manipulation"
                  size="lg"
                  onClick={() => setTutorialStep(4)}
                >
                  <p><T k="lessons.next" /></p>
                </Button>
              </>
            )}
            {tutorialStep === 4 && (
              <>
                <p className="text-center text-lg font-medium sm:text-[22px]">
                  Если ведете урок с помощью
                  <br className="hidden sm:block" />
                  {" "}демонстрации экрана или офлайн:
                </p>
                <p className="mb-2 text-center"></p>
                <div className="mx-auto w-full max-w-[500px]">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p className="text-sm sm:text-base">
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
                  className="min-h-12 w-full touch-manipulation"
                  size="lg"
                  onClick={() => setTutorialStep(5)}
                >
                  <p><T k="lessons.next" /></p>
                </Button>
              </>
            )}
            {tutorialStep === 5 && (
              <>
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <p className="text-center text-lg font-medium sm:text-[22px]">
                      Если вы ведете групповой урок:
                    </p>
                    <div className="h-2"></div>
                    <div className="mx-auto w-full max-w-[500px]">
                      <div className="mb-2 flex items-start gap-2">
                        <div className="shrink-0 pt-[3px]">
                          <Image src={CheckedYellow.src} alt="checked" />
                        </div>
                        <p className="text-sm sm:text-base">
                          если занятие групповое, вы можете переключаться между
                          учениками на панели справа, чтобы увидеть ответы
                          каждого* из них
                        </p>
                      </div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="mb-2 flex items-start gap-2 pt-2 sm:pt-4">
                          <div className="hidden shrink-0 pt-[3px] opacity-0 sm:block">
                            <Image src={CheckedYellow.src} alt="checked" />
                          </div>
                          <p className="text-xs text-[#3F28C6]">
                            *Светло-фиолетовым отмечен ученик,
                            <br className="hidden sm:block" />
                            {" "}ответы которого отображаются на экране
                          </p>
                        </div>
                        <img
                          src={Tutor2.src}
                          alt=""
                          className="mx-auto w-[140px] sm:mx-0 sm:w-[183px]"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    className="min-h-12 w-full touch-manipulation"
                    size="lg"
                    onClick={() => setTutorialStep(6)}
                  >
                    <p><T k="lessons.next" /></p>
                  </Button>
                </div>

                <img
                  src={Tutor1.src}
                  alt=""
                  className="pointer-events-none absolute bottom-0 left-0 z-[-1] hidden w-[280px] sm:block sm:w-[370px]"
                />
              </>
            )}
            {tutorialStep === 6 && (
              <>
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <p className="text-center text-lg font-medium sm:text-[22px]">
                      После завершения урока
                    </p>
                    <p className="text-center text-sm sm:text-base">
                      Все ответы ученика сохраняются.
                      <br />
                      Посмотреть ответы после завершения урока вы можете,
                      <br className="hidden sm:block" />
                      {" "}перейдя в личный кабинет ученика и выбрав нужный урок
                    </p>
                    <div className="h-4"></div>
                  </div>
                  <Button
                    color="primary"
                    className="min-h-12 w-full touch-manipulation"
                    size="lg"
                    onClick={() => setTutorialOpen(false)}
                  >
                    <p><T k="lessons.letsWork" /></p>
                  </Button>
                </div>

                <img
                  src={Tutor3.src}
                  alt=""
                  className="pointer-events-none absolute bottom-0 left-0 z-[-1] hidden max-w-[70%] sm:block sm:w-[500px]"
                />
              </>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="w-[72px] sm:w-[100px]">
                {tutorialStep >= 2 && (
                  <div
                    className={`cursor-pointer touch-manipulation text-sm hover:underline ${
                      tutorialStep === 5 || tutorialStep === 6
                        ? "text-white"
                        : "text-[#B7B7B7]"
                    }`}
                    onClick={() => setTutorialStep((s) => s - 1)}
                  >
                    ← назад
                  </div>
                )}
              </div>
              <p
                className={`text-center text-sm ${
                  tutorialStep === 5 || tutorialStep === 6
                    ? "text-white"
                    : "text-[#B7B7B7]"
                }`}
              >
                {tutorialStep} / 6
              </p>
              <div className="w-[72px] sm:w-[100px]"></div>
            </div>
            <div className="h-2"></div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <DictionaryOnboardingModal
        isOpen={dictionaryOnboardingOpen}
        isTeacher={!!isTeacher}
        onComplete={handleDictionaryOnboardingComplete}
      />
      <LessonDictionaryLayer
        ref={dictionaryRef}
        lessonId={Number(params.id) || undefined}
        lessonStudentIds={students
          ?.map((item) => Number(item.student_id))
          .filter((id) => Number.isInteger(id) && id > 0)}
        defaultAddWordStudentId={
          isStudent && profile?.studentId
            ? Number(profile.studentId)
            : undefined
        }
      />
    </main>
  );
}

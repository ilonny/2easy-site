"use client";
import { useTranslation } from "react-i18next";
import { Input, Image } from "@nextui-org/react";
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLessons } from "../../hooks/useLessons";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";
import { LessonsList } from "../LessonsList";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Dino from "@/assets/images/dino.gif";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import { tabs } from "../LessonsFilters/tabs";
import Loupe from "@/assets/icons/loupe.svg";
import { TLesson } from "../../types";
import { SibscribeContext } from "@/subscribe/context";
import { CreateCourseModalForm } from "../CreateCourseModalForm";
import { TCourse, useCourses } from "@/app/course/hooks/useCourses";
import Link from "next/link";
import { T } from "@/i18n/T";
import { DictionaryModal } from "@/app/dictionary/components/DictionaryModal";
import { useBoardsTab } from "@/app/board/hooks/useBoardsTab";
import { BoardsTabPanel } from "@/app/board/components/BoardsTabPanel";
import { BrandPill } from "@/components/BrandPill";
import { StudentSchedulePanel } from "@/app/student-account/components/StudentSchedulePanel";

type StudentCabinetTab = "lessons" | "courses" | "boards" | "schedule";

const StudentCabinetTabSync = ({
  studentId,
  setStudentTabIndex,
}: {
  studentId: string;
  setStudentTabIndex: (v: StudentCabinetTab) => void;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!studentId) return;
    if (pathname?.includes("/course/")) {
      setStudentTabIndex("courses");
      return;
    }
    const tab = searchParams.get("tab");
    if (tab === "courses") {
      setStudentTabIndex("courses");
      return;
    }
    if (tab === "boards") {
      setStudentTabIndex("boards");
      return;
    }
    if (tab === "schedule") {
      setStudentTabIndex("schedule");
      return;
    }
    setStudentTabIndex("lessons");
  }, [pathname, searchParams, studentId, setStudentTabIndex]);
  return null;
};

type TProps = {
  canCreateLesson?: boolean;
  studentId?: string;
  /** Student row for schedule tab (name, email, teacher user_id) */
  studentInfo?: {
    id: number;
    name?: string;
    email?: string;
    user_id?: string | number;
    school_id?: number | null;
  } | null;
  /** Teacher / school staff may edit schedule */
  canEditSchedule?: boolean;
  hideTabs?: boolean;
  hideAttachButton?: boolean;
  showChangeStatusButton?: boolean;
  hideDeleteLessonButton?: boolean;
  searchString?: string;
  showStartLessonButton?: boolean;
  isStudent?: boolean;
  currentCourse?: TCourse;
  alwaysOpenLessonMode?: boolean;
  showCourseSearch?: boolean;
  includeCourseLessons?: boolean;
  dictionaryModalOpen?: boolean;
  onDictionaryModalChange?: (open: boolean) => void;
  /** Stay on the current page instead of navigating to /lesson_plans */
  stayOnPage?: boolean;
};

const HOMEWORK_TAG = "Homework";

type TLessonsTabIndex =
  | "userLessons"
  | "savedLessons"
  | "userCourses"
  | "2easyCourses"
  | "userBoards";

const LESSONS_TAB_VALUES: TLessonsTabIndex[] = [
  "userLessons",
  "savedLessons",
  "userCourses",
  "2easyCourses",
  "userBoards",
];

const isLessonsTabIndex = (value: unknown): value is TLessonsTabIndex =>
  typeof value === "string" &&
  (LESSONS_TAB_VALUES as string[]).includes(value);

export const ProfileLessons = (props: TProps) => {
  const {
    canCreateLesson = true,
    studentId,
    studentInfo,
    canEditSchedule = false,
    hideTabs,
    hideAttachButton,
    showChangeStatusButton,
    hideDeleteLessonButton,
    searchString,
    showStartLessonButton,
    isStudent,
    currentCourse,
    alwaysOpenLessonMode,
    showCourseSearch,
    includeCourseLessons,
    dictionaryModalOpen: controlledDictionaryModalOpen,
    onDictionaryModalChange,
    stayOnPage = false,
  } = props;
  const router = useRouter();
  const {
    profile,
    isAuthorized,
    authIsLoading,
    createLessonModalIsVisible,
    setCreateLessonModalIsVisible,
  } = useContext(AuthContext);
  // Students auth via studentId/token without login — same as withLogin.
  const hasAuthSession =
    isAuthorized || !!profile?.studentId || !!profile?.isStudent;
  const [createCourseModalIsVisible, setCreateCourseModalIsVisible] =
    useState(false);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const { subscription } = useContext(SibscribeContext);
  const [activeFilterTab, setActiveFilterTab] = useState("");
  // Avoid writing the default tab to localStorage before the saved tab is restored.
  const [tabHydrated, setTabHydrated] = useState(
    () => !!studentId || !!hideTabs || !!currentCourse,
  );

  const isFreeTariff = useMemo(() => {
    return subscription?.subscribe_type_id === 1;
  }, [subscription]);

  const [tabIndex, setTabIndex] = useState<TLessonsTabIndex>(
    currentCourse
      ? "userCourses"
      : !profile?.name
        ? "savedLessons"
        : "userLessons",
  );

  const [studentTabIndex, setStudentTabIndex] =
    useState<StudentCabinetTab>("lessons");
  const [filterSearchString, setFilterSearchString] = useState("");

  const {
    boards,
    boardsIsLoading,
    filteredBoards,
    getBoards,
    isBoardsTabActive,
    showBoardsTabButton,
    createBoardModalIsVisible,
    setCreateBoardModalIsVisible,
    openCreateBoardModal,
    onCreateBoard,
    onPressBoard,
    onStartBoardLesson,
    deleteBoardRelation,
  } = useBoardsTab({
    studentId,
    isTeacher,
    tabIndex,
    setTabIndex,
    studentTabIndex,
    setStudentTabIndex,
    filterSearchString: studentId ? (searchString || "") : filterSearchString,
    keepEmptyBoardsTab: stayOnPage && canCreateLesson,
  });

  const [internalDictionaryModalOpen, setInternalDictionaryModalOpen] =
    useState(false);
  const dictionaryModalOpen =
    controlledDictionaryModalOpen ?? internalDictionaryModalOpen;
  const setDictionaryModalOpen =
    onDictionaryModalChange ?? setInternalDictionaryModalOpen;

  const { courses, coursesIsLoading, getCourses } = useCourses();

  const {
    lessons,
    getLessons,
    lessonsListIslLoading,
    changeLessonStatus,
    deleteLessonRelation,
    courseLessons,
    getCourseLessons,
    changeCourseStatus,
    deleteCourseRelation,
  } = useLessons(
    studentId,
    studentId && studentTabIndex !== "lessons" ? "" : searchString,
    hasAuthSession,
    includeCourseLessons,
  );

  const { t, i18n } = useTranslation();
  const goCatalogTab = useCallback(
    (next: TLessonsTabIndex) => {
      setTabIndex(next);
      if (!stayOnPage) {
        router.push("/lesson_plans");
      }
    },
    [router, stayOnPage],
  );
  const goStudentTab = useCallback(
    (next: StudentCabinetTab) => {
      setStudentTabIndex(next);
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      if (next === "lessons") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.replace(
        `/student-account/${studentId}${qs ? `?${qs}` : ""}`,
        { scroll: false },
      );
    },
    [router, studentId],
  );
  const data = useMemo(() => {
    const title =
      tabIndex === "userLessons" ? (
        <T k="lessons.noLessons" />
      ) : (
        <T k="lessons.noSavedLessons" />
      );
    const buttonTitle =
      tabIndex === "userLessons" ? (
        <T k="lessons.createLesson" />
      ) : (
        <T k="lessons.chooseLesson" />
      );

    const onButtonPress = () => {
      if (tabIndex === "userLessons") {
        setCreateLessonModalIsVisible(true);
        return;
      }
    };

    return { title, buttonTitle, onButtonPress };
  }, [tabIndex]);

  const onCreateLesson = useCallback(
    (lessonId: number) => {
      setCreateLessonModalIsVisible(false);
      getLessons();
      router.push("/editor/" + lessonId);
    },
    [getLessons, router, setCreateLessonModalIsVisible],
  );

  const onCreateCourse = useCallback(() => {
    setCreateCourseModalIsVisible(false);
    setTabIndex("userCourses");
    getCourses(studentId ? Number(studentId) : undefined);
  }, [getCourses, studentId]);

  useEffect(() => {
    if (authIsLoading) return;

    if (currentCourse) {
      getCourseLessons(currentCourse.id, studentId);
      return;
    }

    const controller = new AbortController();
    getLessons(controller.signal);
    return () => controller.abort();
  }, [
    getLessons,
    currentCourse,
    getCourseLessons,
    studentId,
    authIsLoading,
  ]);

  useEffect(() => {
    getCourses(studentId ? Number(studentId) : undefined);
  }, [getCourses, studentId]);

  const { checkSubscription } = useCheckSubscription();

  useEffect(() => {
    // Course/student embeds shouldn't restore or own the global lessons tab.
    if (studentId || hideTabs || currentCourse) {
      setTabHydrated(true);
      return;
    }

    const index = readFromLocalStorage("saved_lessons_tab");
    if (isLessonsTabIndex(index)) {
      setTabIndex(index);
    }
    setTabHydrated(true);
  }, [studentId, hideTabs, currentCourse]);

  useEffect(() => {
    if (!tabHydrated || studentId || hideTabs || currentCourse) {
      return;
    }
    writeToLocalStorage("saved_lessons_tab", tabIndex);
  }, [tabIndex, tabHydrated, studentId, hideTabs, currentCourse]);

  // Mirror boards: don't stay on a courses tab that has nothing to show.
  useEffect(() => {
    if (studentId || hideTabs || currentCourse || coursesIsLoading) {
      return;
    }
    if (tabIndex === "userCourses" && !courses.some((c) => c.user_id !== 1)) {
      setTabIndex(hasAuthSession ? "userLessons" : "savedLessons");
      return;
    }
    if (tabIndex === "2easyCourses" && !courses.some((c) => c.user_id === 1)) {
      setTabIndex(hasAuthSession ? "userLessons" : "savedLessons");
    }
  }, [
    courses,
    coursesIsLoading,
    currentCourse,
    hideTabs,
    hasAuthSession,
    studentId,
    tabIndex,
  ]);

  const lessonsToRender = useMemo(() => {
    // 1. Приоритетный режим: просмотр конкретного курса
    if (currentCourse) {
      return courseLessons;
    }

    // 2. Режим для не-учителя или для студента (если studentId указан)
    // Это условие означает, что мы находимся в "студенческом" представлении,
    // либо пользователь не является учителем
    if (isTeacher && studentId) {
      if (studentTabIndex === "lessons") {
        return lessons;
      }
      if (studentTabIndex === "boards" || studentTabIndex === "schedule") {
        return [];
      }
      return courses;
    }
    if (!isTeacher && studentId) {
      if (studentTabIndex === "lessons") {
        return lessons;
      }
      if (studentTabIndex === "boards" || studentTabIndex === "schedule") {
        return [];
      }
      return courses;
    }

    // 3. Режим для учителя (isTeacher === true && studentId === false/undefined/null)
    // Здесь мы обрабатываем tabIndex для учителя
    switch (tabIndex) {
      case "userCourses":
        return courses.filter((c) => c.user_id !== 1); // Курсы пользователя (кроме user_id=1)
      case "2easyCourses":
        return courses.filter((c) => c.user_id === 1); // Курсы 2easy (user_id=1)
      case "userLessons":
        return lessons.filter((l) => l.user_id !== 1);
      default:
        return lessons.filter((l) => l.user_id === 1);
    }
  }, [
    isTeacher,
    lessons,
    tabIndex,
    studentId,
    currentCourse,
    courseLessons,
    courses,
    studentTabIndex,
  ]);

  const hasHomeworkTag = useCallback((lesson: TLesson) => {
    if (!lesson?.tags) return false;
    const tags = (lesson.tags || "")
      .split(/[,]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    return tags.some((t) => t === "homework");
  }, []);

  const tabsToRender = useMemo(() => {
    if (tabIndex === "savedLessons" || !profile?.name) {
      return tabs;
    }
    if (tabIndex === "userLessons") {
      const hasHomeworkLessons = lessonsToRender.some(hasHomeworkTag);
      return hasHomeworkLessons ? ["All lessons", HOMEWORK_TAG] : ["All lessons"];
    }
    const lessonsTags = lessonsToRender
      .map((l) => {
        return l?.tags?.split(", ") || [];
      })
      .flat();

    return ["All lessons"].concat(
      Array.from(new Set(lessonsTags)).filter(Boolean),
    );
  }, [lessonsToRender, tabIndex, profile?.name, hasHomeworkTag]);

  useEffect(() => {
    if (tabsToRender.length) {
      setActiveFilterTab(tabsToRender?.[0] || "");
    }
    setFilterSearchString("");
  }, [tabsToRender, tabIndex, i18n.language]);

  const filteredLessons = useMemo(() => {
    let res = lessonsToRender;
    const effectiveFilterTab =
      i18n.language === "en" &&
      activeFilterTab.trim().toLowerCase() === "tutorial"
        ? "tutorial-en"
        : activeFilterTab;
    const effectiveSearch = studentId
      ? searchString || ""
      : filterSearchString;

    if (effectiveFilterTab !== "All lessons") {
      res = res.filter((lesson: TLesson) => {
        if (effectiveFilterTab === HOMEWORK_TAG) {
          return hasHomeworkTag(lesson);
        }
        const tagsFilterTabArray = effectiveFilterTab
          .replace(/\s+/g, "")
          .replace("+", "")
          .split("-")
          .map((part) => part.trim())
          .map((part) => part.toLowerCase());
        const lessonTagsArray = lesson.tags
          ?.replace(/[–-]/g, "-")
          ?.replace(/\s+/g, "")
          .replace("+", "")
          .split("-")
          .join(",")
          .split(",")
          .map((part) => part.trim())
          .map((part) => part.toLowerCase());

        if (
          !!lesson.tags &&
          !!lessonTagsArray?.find((t) => tagsFilterTabArray.includes(t))
        ) {
          return true;
        }
        return false;
      });
    }
    if (effectiveSearch) {
      const query = effectiveSearch.toLowerCase();
      res = res.filter((lesson: TLesson) => {
        if (
          lesson.title?.toLowerCase()?.includes(query) ||
          lesson.description?.toLowerCase()?.includes(query) ||
          lesson.tags?.toLowerCase()?.includes(query)
        ) {
          return true;
        }
        return false;
      });
    }
    if (isFreeTariff) {
      res.sort((a, b) => {
        if (Boolean(a.is_free) === Boolean(b.is_free)) {
          return 0; // Same is_free value, no change in order
        } else if (Boolean(a.is_free)) {
          return -1; // a.is_free is true, a comes first
        } else {
          return 1; // b.is_free is true, b comes first
        }
      });
    }
    if (isStudent) {
      res = res.filter(
        (lesson: any) => lesson?.["lesson_relations.status"] !== "close",
      );
    }
    return res;
  }, [
    lessonsToRender,
    activeFilterTab,
    filterSearchString,
    searchString,
    studentId,
    isFreeTariff,
    isStudent,
    hasHomeworkTag,
    i18n.language,
  ]);

  // useEffect(() => {
  //   if (
  //     (tabIndex === "savedLessons" || tabIndex === "userLessons") &&
  //     currentCourse
  //   ) {
  //     router.replace("/lesson_plans");
  //   }
  // }, [currentCourse, tabIndex]);

  const isCourse =
    !currentCourse &&
    ((!studentId && tabIndex === "userCourses") ||
      tabIndex === "2easyCourses" ||
      studentTabIndex === "courses");

  const isListLoading =
    authIsLoading ||
    (!!currentCourse
      ? false
      : isBoardsTabActive
        ? boardsIsLoading
        : isCourse
          ? coursesIsLoading
          : lessonsListIslLoading);

  return (
    <div className="relative z-0 flex w-full min-w-0 flex-col gap-6 lg:gap-8">
      {!!studentId && (
        <Suspense fallback={null}>
          <StudentCabinetTabSync
            studentId={studentId}
            setStudentTabIndex={setStudentTabIndex}
          />
        </Suspense>
      )}
      {!hideTabs && (
        <div className="relative z-0 flex flex-col gap-4 min-[1200px]:gap-6">
          {!!profile?.name ? (
            <div className="flex flex-wrap justify-center gap-1.5 px-1 min-[1200px]:gap-3">
              <BrandPill
                active={tabIndex === "userLessons"}
                onClick={() => goCatalogTab("userLessons")}
              >
                <T k="lessons.myLessons" />
              </BrandPill>
              {(!!courses.some((c) => c.user_id !== 1) ||
                (stayOnPage && canCreateLesson)) && (
                <BrandPill
                  active={tabIndex === "userCourses"}
                  onClick={() => goCatalogTab("userCourses")}
                >
                  <T k="lessons.myCourses" />
                </BrandPill>
              )}
              {showBoardsTabButton || (stayOnPage && canCreateLesson) ? (
                <BrandPill
                  active={tabIndex === "userBoards"}
                  onClick={() => goCatalogTab("userBoards")}
                >
                  <T k="boards.myBoards" />
                </BrandPill>
              ) : null}
              <BrandPill
                active={tabIndex === "savedLessons"}
                onClick={() => goCatalogTab("savedLessons")}
              >
                <T k="lessons.lessons2Easy" />
              </BrandPill>
              {courses.some((c) => c.user_id === 1) && (
                <BrandPill
                  active={tabIndex === "2easyCourses"}
                  onClick={() => goCatalogTab("2easyCourses")}
                >
                  <T k="lessons.courses2Easy" />
                </BrandPill>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-1.5 px-1 min-[1200px]:gap-3">
              <BrandPill
                active={tabIndex === "savedLessons"}
                onClick={() => goCatalogTab("savedLessons")}
              >
                <T k="lessons.lessons2Easy" />
              </BrandPill>
              {courses.some((c) => c.user_id === 1) && (
                <BrandPill
                  active={tabIndex === "2easyCourses"}
                  onClick={() => goCatalogTab("2easyCourses")}
                >
                  <T k="lessons.courses2Easy" />
                </BrandPill>
              )}
            </div>
          )}
          {(tabIndex === "savedLessons" || tabIndex === "userLessons") &&
            tabsToRender?.length >= 2 && (
              <div
                role="tablist"
                aria-label="Filters"
                className="flex flex-wrap justify-center gap-1.5 min-[1200px]:gap-2"
              >
                {tabsToRender.map((filterTab) => (
                  <BrandPill
                    key={filterTab}
                    active={activeFilterTab === filterTab}
                    onClick={() => setActiveFilterTab(filterTab)}
                  >
                    {filterTab}
                  </BrandPill>
                ))}
              </div>
            )}
          <div className="relative z-0 mx-auto w-full min-w-0 max-w-[525px] px-0">
            <Input
              value={filterSearchString}
              onValueChange={setFilterSearchString}
              placeholder={
                tabIndex === "userBoards"
                  ? t("boards.searchBoards")
                  : tabIndex === "userCourses" || tabIndex === "2easyCourses"
                    ? t("lessons.searchCourses")
                    : t("lessons.searchLessons")
              }
              size="md"
              classNames={{
                base: "relative z-0",
                inputWrapper:
                  "min-w-0 rounded-[14px] bg-brand-gray shadow-none data-[hover=true]:bg-[#e6e6ea] group-data-[focus=true]:bg-brand-gray group-data-[focus=true]:shadow-none",
                input: "font-normal text-brand-black",
              }}
              startContent={
                <Image
                  src={Loupe.src}
                  alt="search"
                  style={{ borderRadius: 0 }}
                />
              }
            />
          </div>
        </div>
      )}
      {studentId && (
        <div className="flex flex-wrap justify-center gap-1.5 px-1 min-[1200px]:gap-3">
          <BrandPill
            active={studentTabIndex === "lessons"}
            onClick={() => goStudentTab("lessons")}
          >
            <T k="lessons.lessonsTab" />
          </BrandPill>
          <BrandPill
            active={studentTabIndex === "schedule"}
            onClick={() => goStudentTab("schedule")}
          >
            <T k="students.scheduleTab" />
          </BrandPill>
          <BrandPill
            active={studentTabIndex === "courses"}
            onClick={() => goStudentTab("courses")}
          >
            <T k="lessons.coursesTab" />
          </BrandPill>
          {boards.length > 0 && (
            <BrandPill
              active={studentTabIndex === "boards"}
              onClick={() => goStudentTab("boards")}
            >
              <T k="boards.boardsTab" />
            </BrandPill>
          )}
          <BrandPill onClick={() => setDictionaryModalOpen(true)}>
            <T k="dictionary.tab" defaultText="Словарь" />
          </BrandPill>
        </div>
      )}
      {studentId && studentTabIndex === "schedule" && studentInfo ? (
        <StudentSchedulePanel
          studentId={Number(studentId)}
          student={studentInfo}
          canEdit={!!canEditSchedule}
        />
      ) : null}
      {currentCourse && (
        <>
          <div className="flex flex-col items-center gap-2 px-1 text-center sm:flex-row sm:justify-center sm:gap-4 sm:text-left sm:items-baseline">
            {studentId ? (
              <Link
                href={"/student-account/" + studentId}
                className="shrink-0 text-sm text-brand-violet sm:text-base"
              >
                <T k="lessons.backToStudentAccount" />
              </Link>
            ) : (
              <Link
                href="/lesson_plans"
                className="shrink-0 text-sm text-brand-violet sm:text-base"
              >
                <T k="lessons.allCourses" />
              </Link>
            )}
            <h2 className="max-w-full break-words text-xl font-medium leading-snug text-brand-black sm:text-2xl lg:text-[28px]">
              {currentCourse.title}
            </h2>
          </div>
          <div className="h-4" />
          <p className="text-center">{currentCourse.description}</p>
          <div className="h-10" />
        </>
      )}
      {studentTabIndex !== "schedule" && isListLoading ? (
        <div className="w-full h-[500px] flex justify-center items-center ">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      ) : null}
      {studentTabIndex !== "schedule" &&
        !currentCourse &&
        !isBoardsTabActive &&
        !filteredLessons.length &&
        !isListLoading &&
        !(canCreateLesson && stayOnPage) && (
        <ProfileEmptyLessons
          title={
            (studentId ? searchString : filterSearchString)?.trim() ? (
              <T k="common.nothingFound" />
            ) : studentId ? (
              <T k="lessons.noLessonsShort" />
            ) : (
              data.title
            )
          }
          hideButton={
            !!studentId ||
            !!(studentId ? searchString : filterSearchString)?.trim()
          }
          buttonTitle={data.buttonTitle}
          onButtonPress={data.onButtonPress}
        />
      )}
      {studentTabIndex !== "schedule" &&
        isBoardsTabActive &&
        !boardsIsLoading &&
        !filteredBoards.length &&
        !currentCourse &&
        (!!studentId ||
          !!(studentId ? searchString : filterSearchString)?.trim()) && (
          <ProfileEmptyLessons
            title={
              (studentId ? searchString : filterSearchString)?.trim() ? (
                <T k="common.nothingFound" />
              ) : (
                <T k="boards.noBoards" />
              )
            }
            hideButton
            buttonTitle=""
            onButtonPress={() => {}}
          />
        )}
      <BoardsTabPanel
        boards={filteredBoards}
        isLoading={boardsIsLoading}
        isActive={
          studentTabIndex !== "schedule" &&
          isBoardsTabActive &&
          (filteredBoards.length > 0 ||
            (isTeacher &&
              !studentId &&
              !(studentId ? searchString : filterSearchString)?.trim()))
        }
        hasCurrentCourse={!!currentCourse}
        studentId={studentId}
        isTeacher={isTeacher}
        onPressCreate={openCreateBoardModal}
        onPressBoard={onPressBoard}
        onStartBoardLesson={
          studentId && isTeacher ? onStartBoardLesson : undefined
        }
        getBoards={getBoards}
        createBoardModalIsVisible={createBoardModalIsVisible}
        setCreateBoardModalIsVisible={setCreateBoardModalIsVisible}
        onCreateBoard={onCreateBoard}
        deleteBoardRelation={deleteBoardRelation}
      />
      {studentTabIndex !== "schedule" &&
        !isBoardsTabActive &&
        (!!currentCourse ||
          !!filteredLessons?.length ||
          (canCreateLesson && stayOnPage && !isListLoading)) && (
        <>
          {showCourseSearch && (
            <>
              <div className="h-6"></div>
              <div className="w-full max-w-[525px] m-auto min-w-0 px-0">
                <Input
                  value={filterSearchString}
                  onValueChange={setFilterSearchString}
                  placeholder={t("lessons.searchLessons")}
                  size="lg"
                  classNames={{
                    inputWrapper:
                      "min-w-0 rounded-[14px] bg-brand-gray shadow-none hover:bg-[#e6e6ea] group-data-[focus=true]:bg-brand-gray",
                    input: "font-normal text-brand-black",
                  }}
                  startContent={
                    <Image
                      src={Loupe.src}
                      alt="search"
                      style={{ borderRadius: 0 }}
                    />
                  }
                />
              </div>
            </>
          )}
          <LessonsList
            onPressCreate={() => {
              if (checkSubscription()) {
                setCreateLessonModalIsVisible(true);
              }
            }}
            onPressCreateCourse={() => {
              if (checkSubscription()) {
                setCreateCourseModalIsVisible(true);
              }
            }}
            onPressCreateBoard={isTeacher ? openCreateBoardModal : undefined}
            canCreateLesson={canCreateLesson}
            lessons={filteredLessons}
            getLessons={
              currentCourse
                ? () => getCourseLessons(currentCourse.id, studentId)
                : getLessons
            }
            getCourses={() => getCourses(studentId ? Number(studentId) : undefined)}
            hideAttachButton={hideAttachButton}
            hideContextMenu={tabIndex === "2easyCourses"}
            showChangeStatusButton={showChangeStatusButton}
            changeLessonStatus={
              currentCourse
                ? (relation_id, status, lesson_id, s_id) => {
                    changeLessonStatus(relation_id, status, lesson_id, s_id).then(() => {
                      getCourseLessons(currentCourse.id, studentId);
                    });
                  }
                : studentTabIndex === "courses"
                  ? (relation_id, status, course_id, s_id) => {
                      changeCourseStatus(relation_id, status, course_id, s_id).then(() => {
                        getCourses(studentId ? Number(studentId) : undefined);
                      });
                    }
                  : (relation_id, status, lesson_id, s_id) => {
                      changeLessonStatus(relation_id, status, lesson_id, s_id).then(() => {
                        getCourseLessons(currentCourse.id, studentId);
                      });
                    }
            }
            hideDeleteLessonButton={hideDeleteLessonButton}
            deleteLessonRelation={
              currentCourse
                ? deleteLessonRelation
                : studentTabIndex === "courses"
                  ? (relation_id) => {
                      deleteCourseRelation(relation_id).then(() =>
                        getCourses(studentId ? Number(studentId) : undefined),
                      );
                    }
                  : deleteLessonRelation
            }
            showStartLessonButton={showStartLessonButton}
            isStudent={isStudent}
            isFreeTariff={isFreeTariff}
            isCourses={isCourse}
            openCourseModal={() => setCreateCourseModalIsVisible(true)}
            currentCourse={currentCourse}
            studentId={studentId}
            alwaysOpenLessonMode={alwaysOpenLessonMode}
          />
        </>
      )}
      <CreateLessonModalForm
        isVisible={createLessonModalIsVisible}
        setIsVisible={setCreateLessonModalIsVisible}
        onSuccess={onCreateLesson}
        currentCourse={currentCourse}
      />
      <CreateCourseModalForm
        isVisible={createCourseModalIsVisible}
        setIsVisible={setCreateCourseModalIsVisible}
        onSuccess={onCreateCourse}
      />
      {!!studentId && (
        <DictionaryModal
          isOpen={dictionaryModalOpen}
          onClose={() => setDictionaryModalOpen(false)}
          studentId={Number(studentId)}
        />
      )}
    </div>
  );
};

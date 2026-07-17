"use client";
import { useTranslation } from "react-i18next";
import { Button, Input, Tab, Tabs, Image, Chip } from "@nextui-org/react";
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

const StudentCabinetTabSync = ({
  studentId,
  setStudentTabIndex,
}: {
  studentId: string;
  setStudentTabIndex: (v: "lessons" | "courses" | "boards") => void;
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
    setStudentTabIndex("lessons");
  }, [pathname, searchParams, studentId, setStudentTabIndex]);
  return null;
};

type TProps = {
  canCreateLesson?: boolean;
  studentId?: string;
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
};

const HOMEWORK_TAG = "Homework";

export const ProfileLessons = (props: TProps) => {
  const {
    canCreateLesson = true,
    studentId,
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
  } = props;
  const router = useRouter();
  const { profile, createLessonModalIsVisible, setCreateLessonModalIsVisible } =
    useContext(AuthContext);
  const [createCourseModalIsVisible, setCreateCourseModalIsVisible] =
    useState(false);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const { subscription } = useContext(SibscribeContext);
  const [activeFilterTab, setActiveFilterTab] = useState("");

  const isFreeTariff = useMemo(() => {
    return subscription?.subscribe_type_id === 1;
  }, [subscription]);

  const [tabIndex, setTabIndex] = useState<
    "userLessons" | "savedLessons" | "userCourses" | "2easyCourses" | "userBoards"
  >(
    currentCourse
      ? "userCourses"
      : !profile?.name
        ? "savedLessons"
        : "userLessons",
  );

  const [studentTabIndex, setStudentTabIndex] = useState<
    "lessons" | "courses" | "boards"
  >("lessons");
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
    !!profile?.name,
    includeCourseLessons,
  );

  const { t, i18n } = useTranslation();
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
    getCourses(Number(studentId));
  }, [getCourses, studentId]);

  useEffect(() => {
    if (currentCourse) {
      getCourseLessons(currentCourse.id, studentId);
    } else {
      getLessons();
    }
  }, [getLessons, currentCourse, getCourseLessons, studentId]);

  useEffect(() => {
    getCourses(Number(studentId));
  }, [getCourses, studentId]);

  const { checkSubscription } = useCheckSubscription();

  useEffect(() => {
    const index = readFromLocalStorage("saved_lessons_tab");
    console.log("EFFECT?", studentId);
    if (studentId) {
      return;
    }

    if (index) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setTabIndex(index);
    }
  }, [studentId]);

  useEffect(() => {
    writeToLocalStorage("saved_lessons_tab", tabIndex);
  }, [tabIndex]);

  const lessonsToRender = useMemo(() => {
    // 1. Приоритетный режим: просмотр конкретного курса
    if (currentCourse) {
      return courseLessons;
    }

    // 2. Режим для не-учителя или для студента (если studentId указан)
    // Это условие означает, что мы находимся в "студенческом" представлении,
    // либо пользователь не является учителем
    if (isTeacher && studentId) {
      console.log("isTeacher && studentId", tabIndex, studentTabIndex);
      if (studentTabIndex === "lessons") {
        return lessons;
      }
      if (studentTabIndex === "boards") {
        return [];
      }
      return courses;
    }
    if (!isTeacher && studentId) {
      console.log("lol?", studentTabIndex, lessons, studentId);
      if (studentTabIndex === "lessons") {
        return lessons;
      }
      if (studentTabIndex === "boards") {
        return [];
      }
      return courses;
    }

    // 3. Режим для учителя (isTeacher === true && studentId === false/undefined/null)
    // Здесь мы обрабатываем tabIndex для учителя
    console.log("switch TABINDEX", tabIndex);
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

  console.log("lessonsToRender", lessonsToRender);

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

  return (
    <>
      {!!studentId && (
        <Suspense fallback={null}>
          <StudentCabinetTabSync
            studentId={studentId}
            setStudentTabIndex={setStudentTabIndex}
          />
        </Suspense>
      )}
      {!hideTabs && (
        <>
          {!!profile?.name ? (
            <>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-5 justify-center px-1">
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "userLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("userLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  <T k="lessons.myLessons" />
                </Button>
                {!!courses.some((c) => c.user_id !== 1) && (
                  <Button
                    radius="full"
                    color="primary"
                    variant={tabIndex === "userCourses" ? "solid" : "faded"}
                    onClick={() => {
                      setTabIndex("userCourses");
                      router.push("/lesson_plans");
                    }}
                  >
                    <T k="lessons.myCourses" />
                  </Button>
                )}
                {showBoardsTabButton ? (
                  <Button
                    radius="full"
                    color="primary"
                    variant={tabIndex === "userBoards" ? "solid" : "faded"}
                    onClick={() => {
                      setTabIndex("userBoards");
                      router.push("/lesson_plans");
                    }}
                  >
                    <T k="boards.myBoards" />
                  </Button>
                ) : null}
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "savedLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("savedLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  <T k="lessons.lessons2Easy" />
                </Button>
                {courses.some((c) => c.user_id === 1) && (
                  <div className="relative">
                    <Button
                      radius="full"
                      color="primary"
                      variant={tabIndex === "2easyCourses" ? "solid" : "faded"}
                      onClick={() => {
                        setTabIndex("2easyCourses");
                        router.push("/lesson_plans");
                      }}
                    >
                      <T k="lessons.courses2Easy" />
                    </Button>
                    <Chip
                      color="success"
                      variant="shadow"
                      className="absolute right-[0%] top-[0%] mt-[-14px] mr-[-10px]"
                      size="sm"
                      style={{
                        transform: "rotate(6deg)",
                        pointerEvents: "none",
                      }}
                    >
                      <span className="text-white">NEW</span>
                    </Chip>
                  </div>
                )}
              </div>
              <div className="h-6"></div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-5 justify-center px-1">
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "savedLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("savedLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  <T k="lessons.lessons2Easy" />
                </Button>
                {courses.some((c) => c.user_id === 1) && (
                  <Button
                    radius="full"
                    color="primary"
                    variant={tabIndex === "2easyCourses" ? "solid" : "faded"}
                    onClick={() => {
                      setTabIndex("2easyCourses");
                      router.push("/lesson_plans");
                    }}
                  >
                    <T k="lessons.courses2Easy" />
                  </Button>
                )}
              </div>
              <div className="h-6"></div>
            </>
          )}
          {(tabIndex === "savedLessons" || tabIndex === "userLessons") &&
            tabsToRender?.length >= 2 && (
            <>
              <Tabs
                color="primary"
                size="lg"
                aria-label="Tabs"
                radius={"none"}
                selectedKey={activeFilterTab}
                onSelectionChange={(val) => setActiveFilterTab(val)}
                fullWidth
              >
                {tabsToRender.map((t) => {
                  return <Tab key={t} title={t} />;
                })}
              </Tabs>
            </>
          )}
          <div className="h-6"></div>
          <div className="w-full max-w-[525px] m-auto min-w-0 px-0">
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
              size="lg"
              classNames={{ inputWrapper: "bg-white hove min-w-0" }}
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
      {studentId && (
        <>
          <div className="h-10" />
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-5 justify-center px-1">
            <Button
              radius="full"
              color="primary"
              variant={studentTabIndex === "lessons" ? "solid" : "faded"}
              onClick={() => {
                setStudentTabIndex("lessons");
                router.push(`/student-account/${studentId}`);
              }}
            >
              <T k="lessons.lessonsTab" />
            </Button>
            <Button
              radius="full"
              color="primary"
              variant={studentTabIndex === "courses" ? "solid" : "faded"}
              onClick={() => {
                setStudentTabIndex("courses");
                router.push(`/student-account/${studentId}?tab=courses`);
              }}
            >
              <T k="lessons.coursesTab" />
            </Button>
            {boards.length > 0 && (
              <Button
                radius="full"
                color="primary"
                variant={studentTabIndex === "boards" ? "solid" : "faded"}
                onClick={() => {
                  setStudentTabIndex("boards");
                  router.push(`/student-account/${studentId}?tab=boards`);
                }}
              >
                <T k="boards.boardsTab" />
              </Button>
            )}
            <Button
              radius="full"
              color="primary"
              variant="faded"
              onClick={() => setDictionaryModalOpen(true)}
            >
              <T k="dictionary.tab" defaultText="Словарь" />
            </Button>
          </div>
        </>
      )}
      <div className="h-10" />
      {currentCourse && (
        <>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-4 items-center sm:items-baseline text-center sm:text-left px-1">
            {studentId ? (
              <Link
                href={"/student-account/" + studentId}
                style={{ color: "#3F28C6" }}
                className="shrink-0 text-sm sm:text-base"
              >
                <T k="lessons.backToStudentAccount" />
              </Link>
            ) : (
              <Link href="/lesson_plans" style={{ color: "#3F28C6" }} className="shrink-0 text-sm sm:text-base">
                <T k="lessons.allCourses" />
              </Link>
            )}
            <h2 className="font-medium text-xl sm:text-2xl lg:text-[28px] leading-snug max-w-full break-words">
              {currentCourse.title}
            </h2>
          </div>
          <div className="h-4" />
          <p className="text-center">{currentCourse.description}</p>
          <div className="h-10" />
        </>
      )}
      {(lessonsListIslLoading && !isBoardsTabActive) ||
      (boardsIsLoading && isBoardsTabActive) ? (
        <div className="w-full h-[500px] flex justify-center items-center ">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      ) : null}
      {!currentCourse &&
        !isBoardsTabActive &&
        !filteredLessons.length &&
        !lessonsListIslLoading && (
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
      {isBoardsTabActive &&
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
      {!isBoardsTabActive &&
        (!!currentCourse || !!filteredLessons?.length) && (
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
                  classNames={{ inputWrapper: "bg-white hove min-w-0" }}
                  startContent={
                    <Image
                      src={Loupe.src}
                      alt="search"
                      style={{ borderRadius: 0 }}
                    />
                  }
                />
              </div>
              <div className="h-10"></div>
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
            getCourses={() => getCourses(Number(studentId))}
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
                        getCourses(Number(studentId));
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
                        getCourses(Number(studentId)),
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
    </>
  );
};

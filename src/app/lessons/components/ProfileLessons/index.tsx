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
import {
  TCatalogFolder,
  TCatalogItem,
  useCatalog,
} from "../../hooks/useCatalog";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";
import { LessonsList } from "../LessonsList";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Dino from "@/assets/images/dino.gif";
import { useCheckSubscription, useTeacherPlan } from "@/app/subscription/helpers";
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
import {
  catalogFetchParams,
  studentListFetchParams,
  useCatalogWorkspace,
  withWorkspacePath,
} from "@/app/school/lib/catalogWorkspace";
import { BoardsTabPanel } from "@/app/board/components/BoardsTabPanel";
import { BrandPill } from "@/components/BrandPill";
import { StudentSchedulePanel } from "@/app/student-account/components/StudentSchedulePanel";
import { CreateFolderModalForm } from "../CreateFolderModalForm";
import { DeleteFolderModalForm } from "../DeleteFolderModalForm";
import { MoveToFolderModal } from "../MoveToFolderModal";
import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { Button } from "@nextui-org/react";

type TStudentFolder = TCatalogFolder & {
  lesson_ids?: number[];
  relation_id?: number;
  status?: string;
};

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
  const catalogWorkspace = useCatalogWorkspace();
  const isSchoolLibrary =
    stayOnPage &&
    catalogWorkspace.workspaceScope === "school" &&
    !Number(catalogWorkspace.teacherUserId);
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
    items: catalogItems,
    setItems: setCatalogItems,
    isLoading: catalogIsLoading,
    getCatalog,
    reorderCatalog,
    moveToFolder,
    createFolder,
    editFolder,
    deleteFolder,
    checkFolderContents,
  } = useCatalog();

  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [currentFolderMeta, setCurrentFolderMeta] =
    useState<TCatalogFolder | null>(null);
  const [rootFolders, setRootFolders] = useState<TCatalogFolder[]>([]);
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [editFolderTarget, setEditFolderTarget] =
    useState<TCatalogFolder | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] =
    useState<TCatalogFolder | null>(null);
  const [moveItem, setMoveItem] = useState<(TLesson & { type?: string }) | null>(
    null,
  );
  const [studentFolders, setStudentFolders] = useState<TStudentFolder[]>([]);

  const refreshStudentFolders = useCallback(async () => {
    if (!studentId) {
      setStudentFolders([]);
      return;
    }
    try {
      const res = await fetchGet({
        path: `/folder-relation?student_id=${Number(studentId)}`,
        isSecure: true,
        ...studentListFetchParams(catalogWorkspace),
      });
      const data = await res?.json();
      if (data?.success === false) return;
      setStudentFolders((data?.folders || []) as TStudentFolder[]);
    } catch {
      // Old backends without folder-relation: keep flat lesson list (BC).
      setStudentFolders([]);
    }
  }, [studentId, catalogWorkspace]);

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

  useEffect(() => {
    void refreshStudentFolders();
  }, [refreshStudentFolders, lessons.length]);

  const useCatalogMode =
    !!isTeacher &&
    !studentId &&
    !currentCourse &&
    hasAuthSession &&
    (isSchoolLibrary ||
      tabIndex === "userLessons" ||
      tabIndex === "userCourses" ||
      currentFolderId != null);

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
      isSchoolLibrary && !canCreateLesson ? (
        <T k="school.libraryEmpty" />
      ) : tabIndex === "userLessons" ? (
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
  }, [canCreateLesson, isSchoolLibrary, tabIndex]);

  const refreshCatalog = useCallback(
    async (opts?: { silent?: boolean }) => {
      const data = await getCatalog(
        currentFolderId,
        undefined,
        opts?.silent,
      );
      if (data?.success === false) return data;
      const items = (data?.items || []) as TCatalogItem[];
      setCatalogItems(items);
      if (currentFolderId == null) {
        setRootFolders(
          items.filter((item): item is TCatalogFolder => item.type === "folder"),
        );
      }
      return data;
    },
    [getCatalog, currentFolderId, setCatalogItems],
  );

  const onCreateLesson = useCallback(
    (lessonId: number) => {
      setCreateLessonModalIsVisible(false);
      if (useCatalogMode) {
        void refreshCatalog();
      } else {
        getLessons();
      }
      if (currentCourse?.id) {
        getCourseLessons(currentCourse.id, studentId);
      }
      if (lessonId) {
        router.push(withWorkspacePath("/editor/" + lessonId, catalogWorkspace));
      }
    },
    [
      catalogWorkspace,
      currentCourse?.id,
      getCourseLessons,
      getLessons,
      refreshCatalog,
      router,
      setCreateLessonModalIsVisible,
      studentId,
      useCatalogMode,
    ],
  );

  const onCreateCourse = useCallback(() => {
    setCreateCourseModalIsVisible(false);
    if (currentFolderId != null) {
      void refreshCatalog();
      return;
    }
    setTabIndex("userCourses");
    if (useCatalogMode) {
      void refreshCatalog();
    }
    getCourses(studentId ? Number(studentId) : undefined);
  }, [
    currentFolderId,
    getCourses,
    refreshCatalog,
    studentId,
    useCatalogMode,
  ]);

  useEffect(() => {
    if (authIsLoading) return;

    if (currentCourse) {
      getCourseLessons(currentCourse.id, studentId);
      return;
    }

    if (useCatalogMode) {
      const controller = new AbortController();
      getCatalog(currentFolderId, controller.signal).then((data) => {
        if (!data || data.success === false || controller.signal.aborted) return;
        const items = (data.items || []) as TCatalogItem[];
        setCatalogItems(items);
        if (currentFolderId == null) {
          setRootFolders(
            items.filter((item): item is TCatalogFolder => item.type === "folder"),
          );
        }
      });
      return () => controller.abort();
    }

    const controller = new AbortController();
    getLessons(controller.signal);
    return () => controller.abort();
  }, [
    getLessons,
    getCatalog,
    currentCourse,
    getCourseLessons,
    studentId,
    authIsLoading,
    useCatalogMode,
    currentFolderId,
    tabIndex,
    setCatalogItems,
  ]);

  useEffect(() => {
    getCourses(studentId ? Number(studentId) : undefined);
  }, [getCourses, studentId]);

  useEffect(() => {
    if (tabIndex !== "userLessons" && tabIndex !== "userCourses" && !isSchoolLibrary) {
      setCurrentFolderId(null);
      setCurrentFolderMeta(null);
    }
  }, [tabIndex, isSchoolLibrary]);

  const { checkSubscription } = useCheckSubscription();
  const { schoolOnly, loading: planLoading } = useTeacherPlan();
  // Only a school member without a personal plan loses "My lessons".
  // A regular teacher with no school keeps their own catalog.
  const hideMyLessons =
    !stayOnPage &&
    !studentId &&
    !currentCourse &&
    !isSchoolLibrary &&
    !planLoading &&
    schoolOnly;

  useEffect(() => {
    // Course/student embeds shouldn't restore or own the global lessons tab.
    if (studentId || hideTabs || currentCourse) {
      setTabHydrated(true);
      return;
    }

    const index = readFromLocalStorage("saved_lessons_tab");
    if (isLessonsTabIndex(index)) {
      if (
        isSchoolLibrary &&
        (index === "savedLessons" || index === "2easyCourses")
      ) {
        setTabIndex("userLessons");
      } else {
        setTabIndex(index);
      }
    }
    setTabHydrated(true);
  }, [studentId, hideTabs, currentCourse, isSchoolLibrary]);

  useEffect(() => {
    if (!tabHydrated || studentId || hideTabs || currentCourse) {
      return;
    }
    writeToLocalStorage("saved_lessons_tab", tabIndex);
  }, [tabIndex, tabHydrated, studentId, hideTabs, currentCourse]);

  // Mirror boards: don't stay on a courses tab that has nothing to show.
  useEffect(() => {
    if (
      !isSchoolLibrary ||
      (tabIndex !== "savedLessons" && tabIndex !== "2easyCourses")
    ) {
      return;
    }
    setTabIndex("userLessons");
  }, [isSchoolLibrary, tabIndex]);

  useEffect(() => {
    if (!hideMyLessons || tabIndex !== "userLessons") return;
    setTabIndex("savedLessons");
  }, [hideMyLessons, tabIndex]);

  useEffect(() => {
    const onCatalogChange = () => {
      getLessons();
    };
    window.addEventListener("catalog-lessons-changed", onCatalogChange);
    return () =>
      window.removeEventListener("catalog-lessons-changed", onCatalogChange);
  }, [getLessons]);

  useEffect(() => {
    if (
      studentId ||
      hideTabs ||
      currentCourse ||
      coursesIsLoading ||
      isSchoolLibrary
    ) {
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
    isSchoolLibrary,
    studentId,
    tabIndex,
  ]);

  const lessonsToRender = useMemo(() => {
    // 1. Приоритетный режим: просмотр конкретного курса
    if (currentCourse) {
      return courseLessons;
    }

    // Catalog v2: keep "Мои уроки" / "Мои курсы" split at root.
    // Inside a folder both types can appear (folders hold mixed content).
    if (useCatalogMode) {
      if (currentFolderId != null) {
        return catalogItems as unknown as TLesson[];
      }
      if (tabIndex === "userCourses") {
        return catalogItems.filter(
          (item) => item.type === "course",
        ) as unknown as TLesson[];
      }
      // userLessons / school library root: folders + lessons only
      return catalogItems.filter(
        (item) => item.type === "folder" || item.type === "lesson",
      ) as unknown as TLesson[];
    }

    // 2. Student cabinet (teacher viewing student or student self):
    // folders are additive UI; lessons remain available flat if folders empty (BC).
    if (studentId) {
      if (studentTabIndex === "boards" || studentTabIndex === "schedule") {
        return [];
      }
      if (studentTabIndex === "courses") {
        return courses as unknown as TLesson[];
      }
      const folderLessonIds = new Set(
        studentFolders.flatMap((f) =>
          (f.lesson_ids || []).map((id) => Number(id)),
        ),
      );
      if (currentFolderId != null) {
        const ids = new Set(
          (
            studentFolders.find((f) => Number(f.id) === Number(currentFolderId))
              ?.lesson_ids || []
          ).map((id) => Number(id)),
        );
        return lessons.filter((l) => ids.has(Number(l.id)));
      }
      if (studentFolders.length) {
        return [
          ...studentFolders.map((f) => ({ ...f, type: "folder" as const })),
          ...lessons.filter((l) => !folderLessonIds.has(Number(l.id))),
        ] as unknown as TLesson[];
      }
      return lessons;
    }

    // 3. Режим для учителя
    switch (tabIndex) {
      case "userCourses":
        return courses.filter((c) => c.user_id !== 1);
      case "2easyCourses":
        return courses.filter((c) => c.user_id === 1);
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
    useCatalogMode,
    catalogItems,
    currentFolderId,
    studentFolders,
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
    // My lessons / my courses / folders: no level or "All lessons"/"Homework" filter pills.
    if (
      useCatalogMode ||
      tabIndex === "userLessons" ||
      tabIndex === "userCourses"
    ) {
      return [];
    }
    if (tabIndex === "savedLessons" || !profile?.name) {
      return tabs;
    }
    const lessonsTags = lessonsToRender
      .map((l) => {
        return l?.tags?.split(", ") || [];
      })
      .flat();

    return ["All lessons"].concat(
      Array.from(new Set(lessonsTags)).filter(Boolean),
    );
  }, [lessonsToRender, tabIndex, profile?.name, useCatalogMode]);

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

    // No level pills on my catalog — empty/unset filter must not hide everything.
    if (
      effectiveFilterTab &&
      effectiveFilterTab !== "All lessons" &&
      tabsToRender.length > 0
    ) {
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
    if (isFreeTariff && !studentId) {
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
    tabsToRender.length,
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
    currentFolderId == null &&
    ((!studentId && tabIndex === "userCourses") ||
      tabIndex === "2easyCourses" ||
      studentTabIndex === "courses");

  const isListLoading =
    authIsLoading ||
    (!!currentCourse
      ? false
      : isBoardsTabActive
        ? boardsIsLoading
        : useCatalogMode
          ? catalogIsLoading
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
              {!hideMyLessons && (
                <BrandPill
                  active={tabIndex === "userLessons"}
                  onClick={() => goCatalogTab("userLessons")}
                >
                  <T
                    k={
                      isSchoolLibrary
                        ? "lessons.lessonsTab"
                        : "lessons.myLessons"
                    }
                  />
                </BrandPill>
              )}
              {(!!courses.some((c) => c.user_id !== 1) ||
                isSchoolLibrary ||
                (stayOnPage && canCreateLesson)) && (
                <BrandPill
                  active={tabIndex === "userCourses"}
                  onClick={() => goCatalogTab("userCourses")}
                >
                  <T
                    k={
                      isSchoolLibrary
                        ? "lessons.coursesTab"
                        : "lessons.myCourses"
                    }
                  />
                </BrandPill>
              )}
              {showBoardsTabButton ||
              isSchoolLibrary ||
              (stayOnPage && canCreateLesson) ? (
                <BrandPill
                  active={tabIndex === "userBoards"}
                  onClick={() => goCatalogTab("userBoards")}
                >
                  <T
                    k={
                      isSchoolLibrary ? "boards.boardsTab" : "boards.myBoards"
                    }
                  />
                </BrandPill>
              ) : null}
              {!isSchoolLibrary ? (
                <BrandPill
                  active={tabIndex === "savedLessons"}
                  onClick={() => goCatalogTab("savedLessons")}
                >
                  <T k="lessons.lessons2Easy" />
                </BrandPill>
              ) : null}
              {!isSchoolLibrary && courses.some((c) => c.user_id === 1) && (
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
                href={
                  typeof window !== "undefined"
                    ? `/student-account/${studentId}${window.location.search}`
                    : "/student-account/" + studentId
                }
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
        !(canCreateLesson && (stayOnPage || useCatalogMode)) && (
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
            !!(studentId ? searchString : filterSearchString)?.trim() ||
            (stayOnPage && !canCreateLesson)
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
          (canCreateLesson &&
            (stayOnPage || useCatalogMode) &&
            !isListLoading)) && (
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
          {currentFolderId != null && (
            <div className="mb-2 flex items-center gap-3 px-1">
              <Button
                size="sm"
                variant="flat"
                className="rounded-[12px]"
                onClick={() => {
                  setCurrentFolderId(null);
                  setCurrentFolderMeta(null);
                }}
              >
                ← <T k="lessons.backToMyLessons" />
              </Button>
              {currentFolderMeta?.title ? (
                <span className="text-sm font-medium text-brand-black">
                  📁 {currentFolderMeta.title}
                </span>
              ) : null}
            </div>
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
            onPressCreateFolder={
              useCatalogMode &&
              currentFolderId == null &&
              (tabIndex === "userLessons" || isSchoolLibrary)
                ? () => {
                    if (checkSubscription()) setCreateFolderVisible(true);
                  }
                : undefined
            }
            onPressCreateBoard={
              useCatalogMode && currentFolderId != null
                ? undefined
                : isTeacher
                  ? openCreateBoardModal
                  : undefined
            }
            canCreateLesson={canCreateLesson && !hideMyLessons}
            lessons={filteredLessons}
            getLessons={
              currentCourse
                ? () => getCourseLessons(currentCourse.id, studentId)
                : useCatalogMode
                  ? () => {
                      void refreshCatalog();
                    }
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
            enableCatalogDnd={
              (!!useCatalogMode || !!currentCourse) &&
              !isStudent &&
              tabIndex !== "2easyCourses" &&
              tabIndex !== "savedLessons"
            }
            currentFolderId={currentFolderId}
            onEnterFolder={(folderId) => {
              const meta = (catalogItems.find(
                (item) => item.type === "folder" && item.id === folderId,
              ) ||
                rootFolders.find((f) => f.id === folderId) ||
                studentFolders.find((f) => Number(f.id) === Number(folderId))) as
                | TCatalogFolder
                | undefined;
              setCurrentFolderMeta(meta || null);
              setCurrentFolderId(folderId);
              if (!studentId && tabIndex !== "userLessons") {
                setTabIndex("userLessons");
              }
            }}
            onReorderItems={async (ordered) => {
              if (currentCourse?.id) {
                const lessonIds = ordered
                  .filter((item) => item.type === "lesson")
                  .map((item) => item.id);
                setCatalogItems((prev) => prev);
                const res = await fetchPostJson({
                  path: "/course/edit",
                  isSecure: true,
                  ...catalogFetchParams(catalogWorkspace),
                  data: {
                    id: currentCourse.id,
                    title: currentCourse.title,
                    description: currentCourse.description,
                    tags: currentCourse.tags,
                    image_id: currentCourse.image_id,
                    lesson_ids: JSON.stringify(lessonIds),
                  },
                });
                const data = await res.json();
                checkResponse(data);
                getCourseLessons(currentCourse.id, studentId);
                return;
              }
              // Optimistic local reorder — do not full-refresh (that flips the
              // page loader / dino and feels like a hard reload).
              const prevItems = catalogItems;
              const byKey = new Map(
                catalogItems.map((item) => [`${item.type}:${item.id}`, item]),
              );
              // Keep items not in this view (e.g. courses on "Мои уроки") in place.
              const orderedKeys = new Set(
                ordered.map((item) => `${item.type}:${item.id}`),
              );
              const reorderedVisible = ordered
                .map((item) => byKey.get(`${item.type}:${item.id}`))
                .filter(Boolean) as TCatalogItem[];
              const rest = catalogItems.filter(
                (item) => !orderedKeys.has(`${item.type}:${item.id}`),
              );
              if (reorderedVisible.length) {
                setCatalogItems([...reorderedVisible, ...rest]);
              }
              try {
                const data = await reorderCatalog(currentFolderId, ordered);
                if (data?.success === false) {
                  setCatalogItems(prevItems);
                }
              } catch {
                setCatalogItems(prevItems);
              }
            }}
            onDropOnFolder={async (item, folderId) => {
              if (item.type === "folder") return;
              setCatalogItems((prev) =>
                prev.filter(
                  (row) =>
                    !(row.type === item.type && Number(row.id) === Number(item.id)),
                ),
              );
              try {
                await moveToFolder(item.type, item.id, folderId);
              } finally {
                void refreshCatalog({ silent: true });
              }
            }}
            onMoveToFolderRequest={(lesson) => setMoveItem(lesson)}
            onEditFolder={(folder) =>
              setEditFolderTarget(folder as unknown as TCatalogFolder)
            }
            onDeleteFolder={(folder) =>
              setDeleteFolderTarget(folder as unknown as TCatalogFolder)
            }
          />
        </>
      )}
      <CreateLessonModalForm
        isVisible={createLessonModalIsVisible}
        setIsVisible={setCreateLessonModalIsVisible}
        onSuccess={onCreateLesson}
        currentCourse={currentCourse}
        folderId={currentFolderId}
      />
      <CreateCourseModalForm
        isVisible={createCourseModalIsVisible}
        setIsVisible={setCreateCourseModalIsVisible}
        onSuccess={onCreateCourse}
        folderId={currentFolderId}
      />
      <CreateFolderModalForm
        isVisible={createFolderVisible || !!editFolderTarget}
        setIsVisible={(v) => {
          if (!v) {
            setCreateFolderVisible(false);
            setEditFolderTarget(null);
          } else {
            setCreateFolderVisible(true);
          }
        }}
        folder={editFolderTarget}
        onSubmitFolder={async (data) => {
          if (data.id) {
            await editFolder({
              id: data.id,
              title: data.title,
              description: data.description,
              tags: data.tags,
              image_id: data.image_id,
            });
          } else {
            await createFolder({
              title: data.title,
              description: data.description,
              tags: data.tags,
              image_id: data.image_id,
            });
          }
          setEditFolderTarget(null);
          setCreateFolderVisible(false);
          await refreshCatalog();
        }}
      />
      <DeleteFolderModalForm
        isVisible={!!deleteFolderTarget}
        setIsVisible={(v) => {
          if (!v) setDeleteFolderTarget(null);
        }}
        folder={deleteFolderTarget}
        onCheck={async (id) => checkFolderContents(id)}
        onDelete={async (id, force) => deleteFolder(id, force)}
        onSuccess={() => {
          setDeleteFolderTarget(null);
          if (currentFolderId === deleteFolderTarget?.id) {
            setCurrentFolderId(null);
            setCurrentFolderMeta(null);
          }
          void refreshCatalog();
        }}
      />
      <MoveToFolderModal
        isVisible={!!moveItem}
        setIsVisible={(v) => {
          if (!v) setMoveItem(null);
        }}
        folders={rootFolders}
        currentFolderId={
          moveItem?.folder_id != null
            ? Number(moveItem.folder_id)
            : currentFolderId
        }
        onPick={async (folderId) => {
          if (!moveItem) return;
          const type =
            moveItem.type === "course" || isCourse ? "course" : "lesson";
          await moveToFolder(type, moveItem.id, folderId);
          setMoveItem(null);
          await refreshCatalog();
        }}
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

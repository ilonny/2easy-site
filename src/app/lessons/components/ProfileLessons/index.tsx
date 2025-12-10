import { Button, Input, Tab, Tabs, Image } from "@nextui-org/react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLessons } from "../../hooks/useLessons";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";
import { LessonsList } from "../LessonsList";
import { useRouter } from "next/navigation";
import Dino from "@/assets/images/dino.gif";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import { LessonsFilters } from "../LessonsFilters";
import { tabs } from "../LessonsFilters/tabs";
import Loupe from "@/assets/icons/loupe.svg";
import { TLesson } from "../../types";
import { SibscribeContext } from "@/subscribe/context";
import { CreateCourseModalForm } from "../CreateCourseModalForm";
import { TCourse, useCourses } from "@/app/course/hooks/useCourses";
import { AttachLessonCourseModalForm } from "../AttachLessonCourseModalForm";
import Link from "next/link";

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
};

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
    "userLessons" | "savedLessons" | "userCourses" | "2easyCourses"
  >(
    currentCourse
      ? "userCourses"
      : !profile?.name
      ? "savedLessons"
      : "userLessons"
  );

  const [studentTabIndex, setStudentTabIndex] = useState<"lessons" | "courses">(
    "lessons"
  );

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
  } = useLessons(studentId, searchString, !!profile?.name);

  const data = useMemo(() => {
    const title =
      tabIndex === "userLessons"
        ? "У вас пока нет уроков.\nСоздайте свой первый урок с конструктором 2EASY"
        : "У вас нет сохраненных уроков.";
    const buttonTitle =
      tabIndex === "userLessons" ? "Cоздать урок" : "Выбрать урок 2EASY";

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
    [getLessons, router, setCreateLessonModalIsVisible]
  );

  const onCreateCourse = useCallback(() => {
    setCreateCourseModalIsVisible(false);
    setTabIndex("userCourses");
    getCourses(Number(studentId));
  }, [getCourses]);

  useEffect(() => {
    if (currentCourse) {
      getCourseLessons(currentCourse.id);
    } else {
      getLessons();
    }
  }, [getLessons, currentCourse]);

  useEffect(() => {
    getCourses(Number(studentId));
  }, [getCourses, studentId]);

  const { checkSubscription } = useCheckSubscription();

  useEffect(() => {
    const index = readFromLocalStorage("saved_lessons_tab");
    if (index) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setTabIndex(index);
    }
  }, []);

  useEffect(() => {
    writeToLocalStorage("saved_lessons_tab", tabIndex);
  }, [tabIndex]);

  const [filterSearchString, setFilterSearchString] = useState("");

  const lessonsToRender = useMemo(() => {
    // 1. Приоритетный режим: просмотр конкретного курса
    if (currentCourse) {
      return courseLessons;
    }

    // 2. Режим для не-учителя или для студента (если studentId указан)
    // Это условие означает, что мы находимся в "студенческом" представлении,
    // либо пользователь не является учителем
    if (!isTeacher && studentId) {
      console.log("lol?", studentTabIndex, lessons, studentId); // Для отладки, если нужно
      if (studentTabIndex === "lessons") {
        return lessons; // Если студент смотрит список всех уроков
      }
      return courses; // Если студент смотрит список всех курсов
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
        return lessons.filter((l) => l.user_id !== 1); // Уроки пользователя (кроме user_id=1)
      default:
        // Это условие соответствует закомментированному 'return lessons;'
        // и вашей последней строке 'return lessons.filter((l) => l.user_id === 1);'
        // Я предполагаю, что в этом случае вы хотите показывать уроки 2easy.
        return lessons.filter((l) => l.user_id === 1); // Уроки 2easy (user_id=1)
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

  const tabsToRender = useMemo(() => {
    if (tabIndex === "savedLessons" || !profile?.name) {
      return tabs;
    }
    const lessonsTags = lessonsToRender
      .map((l) => {
        return l?.tags?.split(", ") || [];
      })
      .flat();

    return ["All lessons"].concat(
      Array.from(new Set(lessonsTags)).filter(Boolean)
    );
  }, [lessonsToRender, tabIndex, profile?.name]);

  useEffect(() => {
    if (tabsToRender.length) {
      setActiveFilterTab(tabsToRender?.[0] || "");
    }
    setFilterSearchString("");
  }, [tabsToRender, tabIndex]);

  const filteredLessons = useMemo(() => {
    let res = lessonsToRender;
    if (activeFilterTab !== "All lessons") {
      res = res.filter((lesson: TLesson) => {
        const tagsFilterTabArray = activeFilterTab
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
    if (filterSearchString) {
      res = res.filter((lesson: TLesson) => {
        if (
          lesson.title
            ?.toLowerCase()
            ?.includes(filterSearchString?.toLowerCase()) ||
          lesson.description
            ?.toLowerCase()
            ?.includes(filterSearchString?.toLowerCase()) ||
          lesson.tags
            ?.toLowerCase()
            ?.includes(filterSearchString?.toLowerCase())
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
    return res;
  }, [lessonsToRender, activeFilterTab, filterSearchString, isFreeTariff]);

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

  console.log("isCourse?", isCourse, tabIndex, isStudent, studentId);
  return (
    <>
      {!hideTabs && (
        <>
          {!!profile?.name ? (
            <>
              <div className="flex gap-5 justify-center">
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "userLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("userLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  Мои уроки
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
                    Мои курсы
                  </Button>
                )}
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "savedLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("savedLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  Уроки 2EASY
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
                    Курсы 2EASY
                  </Button>
                )}
              </div>
              <div className="h-6"></div>
            </>
          ) : (
            <>
              <div className="flex gap-5 justify-center">
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "savedLessons" ? "solid" : "faded"}
                  onClick={() => {
                    setTabIndex("savedLessons");
                    router.push("/lesson_plans");
                  }}
                >
                  Уроки 2EASY
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
                    Курсы 2EASY
                  </Button>
                )}
              </div>
              <div className="h-6"></div>
            </>
          )}
          {tabIndex === "savedLessons" && tabsToRender?.length >= 2 && (
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
          <div className="w-[100%] lg:w-[525px] m-auto">
            <Input
              value={filterSearchString}
              onValueChange={setFilterSearchString}
              placeholder="Поиск уроков"
              size="lg"
              classNames={{ inputWrapper: "bg-white hove" }}
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
          <div className="flex gap-5 justify-center">
            <Button
              radius="full"
              color="primary"
              variant={studentTabIndex === "lessons" ? "solid" : "faded"}
              onClick={() => setStudentTabIndex("lessons")}
            >
              Уроки
            </Button>
            <Button
              radius="full"
              color="primary"
              variant={studentTabIndex === "courses" ? "solid" : "faded"}
              onClick={() => setStudentTabIndex("courses")}
            >
              Курсы
            </Button>
          </div>
        </>
      )}
      <div className="h-10" />
      {currentCourse && (
        <>
          <div className="flex flex-row justify-center gap-4 items-baseline">
            <Link href="/lesson_plans" style={{ color: "#3F28C6" }}>
              ← все курсы
            </Link>
            <h2 style={{ fontWeight: "500", fontSize: 28 }}>
              {currentCourse.title}
            </h2>
          </div>
          <div className="h-4" />
          <p>{currentCourse.description}</p>
          <div className="h-10" />
        </>
      )}
      {lessonsListIslLoading && (
        <div className="w-full h-[500px] flex justify-center items-center ">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      )}
      {!currentCourse && !lessons.length && (
        <ProfileEmptyLessons
          title={studentId ? "Пока нет уроков." : data.title}
          hideButton={!!studentId}
          buttonTitle={data.buttonTitle}
          onButtonPress={data.onButtonPress}
        />
      )}
      {(!!currentCourse || !!lessons?.length) && (
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
          canCreateLesson={canCreateLesson}
          lessons={filteredLessons}
          getLessons={
            currentCourse
              ? () => getCourseLessons(currentCourse.id)
              : getLessons
          }
          getCourses={() => getCourses(Number(studentId))}
          hideAttachButton={hideAttachButton}
          hideContextMenu={tabIndex === "2easyCourses"}
          showChangeStatusButton={showChangeStatusButton}
          changeLessonStatus={
            studentTabIndex === "courses"
              ? (relation_id, status) => {
                  changeCourseStatus(relation_id, status).then(() =>
                    getCourses(Number(studentId))
                  );
                }
              : changeLessonStatus
          }
          hideDeleteLessonButton={hideDeleteLessonButton}
          deleteLessonRelation={
            studentTabIndex === "courses"
              ? (relation_id) => {
                  deleteCourseRelation(relation_id).then(() =>
                    getCourses(Number(studentId))
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
        />
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
    </>
  );
};

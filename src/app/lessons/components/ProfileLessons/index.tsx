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
  } = props;
  const router = useRouter();
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const [activeFilterTab, setActiveFilterTab] = useState("");

  const [tabIndex, setTabIndex] = useState<"userLessons" | "savedLessons">(
    "userLessons"
  );

  const [createLessonModalIsVisible, setCreateLessonModalIsVisible] =
    useState(false);

  const {
    lessons,
    getLessons,
    lessonsListIslLoading,
    changeLessonStatus,
    deleteLessonRelation,
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
    [getLessons, router]
  );

  useEffect(() => {
    getLessons();
  }, [getLessons]);

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
    if (!isTeacher || studentId) {
      return lessons;
    }
    if (tabIndex === "userLessons" && !studentId) {
      return lessons.filter((l) => l.user_id !== 1);
    }
    // return lessons;
    return lessons.filter((l) => l.user_id === 1);
  }, [isTeacher, lessons, tabIndex, studentId]);

  const tabsToRender = useMemo(() => {
    if (tabIndex === "savedLessons" || !profile?.name) {
      return tabs;
    }
    return ["All lessons"].concat(
      Array.from(
        new Set(
          lessonsToRender.map((lesson) => {
            return lesson.tags;
          })
        )
      ).filter(Boolean)
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
    return res;
  }, [activeFilterTab, filterSearchString, lessonsToRender]);
  console.log("lessons to render", lessonsToRender);
  console.log("filtered lessons", filteredLessons);
  return (
    <>
      {!hideTabs && (
        <>
          {!!profile?.name && (
            <>
              <div className="flex gap-5 justify-center">
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "userLessons" ? "solid" : "faded"}
                  onClick={() => setTabIndex("userLessons")}
                >
                  Мои уроки
                </Button>
                <Button
                  radius="full"
                  color="primary"
                  variant={tabIndex === "savedLessons" ? "solid" : "faded"}
                  onClick={() => setTabIndex("savedLessons")}
                >
                  Уроки 2EASY
                </Button>
              </div>
              <div className="h-6"></div>
            </>
          )}
          {tabsToRender?.length >= 2 && (
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
      <div className="h-10" />
      {lessonsListIslLoading && (
        <div className="w-full h-[500px] flex justify-center items-center ">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      )}
      {!lessons.length && (
        <ProfileEmptyLessons
          title={studentId ? "Пока нет уроков." : data.title}
          hideButton={!!studentId}
          buttonTitle={data.buttonTitle}
          onButtonPress={data.onButtonPress}
        />
      )}
      {!!lessons?.length && (
        <LessonsList
          onPressCreate={() => {
            if (checkSubscription()) {
              setCreateLessonModalIsVisible(true);
            }
          }}
          canCreateLesson={canCreateLesson}
          lessons={filteredLessons}
          getLessons={getLessons}
          hideAttachButton={hideAttachButton}
          showChangeStatusButton={showChangeStatusButton}
          changeLessonStatus={changeLessonStatus}
          hideDeleteLessonButton={hideDeleteLessonButton}
          deleteLessonRelation={deleteLessonRelation}
          showStartLessonButton={showStartLessonButton}
          isStudent={isStudent}
        />
      )}
      <CreateLessonModalForm
        isVisible={createLessonModalIsVisible}
        setIsVisible={setCreateLessonModalIsVisible}
        onSuccess={onCreateLesson}
      />
    </>
  );
};

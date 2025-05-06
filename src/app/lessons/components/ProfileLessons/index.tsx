import { Button } from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLessons } from "../../hooks/useLessons";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";
import { LessonsList } from "../LessonsList";
import { useRouter } from "next/navigation";

export const ProfileLessons = () => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState<"userLessons" | "savedLessons">(
    "userLessons"
  );

  const [createLessonModalIsVisible, setCreateLessonModalIsVisible] =
    useState(false);

  const { lessons, getLessons } = useLessons();

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

  useEffect(() => {
    getLessons();
  }, [getLessons]);

  const onCreateLesson = useCallback(
    (lessonId: number) => {
      setCreateLessonModalIsVisible(false);
      getLessons();
      router.push("/editor/" + lessonId);
    },
    [getLessons, router]
  );

  return (
    <>
      <div className="flex gap-5">
        <Button
          radius="full"
          color="primary"
          variant={tabIndex === "userLessons" ? "solid" : "faded"}
          onClick={() => setTabIndex("userLessons")}
        >
          Созданные уроки
        </Button>
        <Button
          radius="full"
          color="primary"
          variant={tabIndex === "savedLessons" ? "solid" : "faded"}
          onClick={() => setTabIndex("savedLessons")}
        >
          Сохранённые уроки
        </Button>
      </div>
      <div className="h-10" />
      {!lessons.length && (
        <ProfileEmptyLessons
          title={data.title}
          buttonTitle={data.buttonTitle}
          onButtonPress={data.onButtonPress}
        />
      )}
      {!!lessons?.length && (
        <LessonsList
          onPressCreate={() => setCreateLessonModalIsVisible(true)}
          canCreateLesson
          lessons={lessons}
          getLessons={getLessons}
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

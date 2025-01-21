import { Button } from "@nextui-org/react";
import { useMemo, useState } from "react";
import { useLessons } from "../../hooks/useLessons";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";

export const ProfileLessons = () => {
  const [tabIndex, setTabIndex] = useState<"userLessons" | "2easyLessons">(
    "userLessons"
  );

  const [createLessonModalIsVisible, setCreateLessonModalIsVisible] =
    useState(false);

  const { lessons } = useLessons();

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

  return (
    <>
      <div className="flex gap-5">
        <Button radius="full" color="primary">
          Созданные уроки
        </Button>
        <Button radius="full" color="primary" variant="faded">
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
      <CreateLessonModalForm
        isVisible={createLessonModalIsVisible}
        setIsVisible={setCreateLessonModalIsVisible}
      />
    </>
  );
};

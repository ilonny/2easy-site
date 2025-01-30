import { FC, useCallback, useEffect, useState } from "react";
import { TLesson } from "../../types";
import { LessonCard } from "../LessonCard";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { EditLessonModalForm } from "../EditLessonModalForm";
import { DeleteLessonModalForm } from "../DeleteLessonModalForm";

type TProps = {
  lessons: TLesson[];
  canCreateLesson?: boolean;
  onPressCreate?: () => void;
  getLessons: () => void;
};

export const LessonsList: FC<TProps> = ({
  lessons,
  canCreateLesson,
  onPressCreate,
  getLessons,
}) => {
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [chosenLesson, setChosenLesson] = useState<TLesson | null>(null);

  const onPressEdit = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setEditIsVisible(true);
  }, []);

  const onPressDelete = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setDeleteIsVisible(true);
  }, []);

  const onSuccessEdit = useCallback(() => {
    setEditIsVisible(false);
    getLessons();
    setChosenLesson(null);
  }, [getLessons]);

  useEffect(() => {
    if (!editIsVisible && !deleteIsVisible) {
      setChosenLesson(null);
    }
  }, [editIsVisible, deleteIsVisible]);

  return (
    <div className="flex items-start justify-start w-full flex-wrap">
      {canCreateLesson && (
        <div style={{ width: "25%" }} className="p-2">
          <div
            className="image-wrapper"
            style={{
              width: "100%",
              height: 317,
              position: "relative",
              overflow: "hidden",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <div
              style={{
                width: "104%",
                height: "104%",
                background: `url(${Bg.src}) center center no-repeat #fff`,
                backgroundSize: "cover",
              }}
            />
          </div>
          <div className="p-4 bg-white ">
            <Button
              color="primary"
              className="w-full"
              size="lg"
              onClick={onPressCreate}
            >
              Создать урок
            </Button>
            <div className="h-2" />
          </div>
        </div>
      )}
      {lessons?.map((lesson) => {
        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onPressEdit={onPressEdit}
            onPressDelete={onPressDelete}
          />
        );
      })}

      {!!chosenLesson && (
        <>
          <EditLessonModalForm
            isVisible={editIsVisible}
            setIsVisible={setEditIsVisible}
            lesson={chosenLesson}
            key={chosenLesson?.id}
            onSuccess={onSuccessEdit}
          />
          <DeleteLessonModalForm
            isVisible={deleteIsVisible}
            setIsVisible={setDeleteIsVisible}
            lesson={chosenLesson}
            key={chosenLesson?.id}
            onSuccess={onSuccessEdit}
          />
        </>
      )}
    </div>
  );
};

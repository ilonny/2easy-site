import { FC, useCallback, useEffect, useState } from "react";
import { TLesson } from "../../types";
import { LessonCard } from "../LessonCard";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { EditLessonModalForm } from "../EditLessonModalForm";
import { DeleteLessonModalForm } from "../DeleteLessonModalForm";
import { AttachLessonModalForm } from "../AttachLessonModalForm";

type TProps = {
  lessons: TLesson[];
  canCreateLesson?: boolean;
  canAttachLesson?: boolean;
  onPressCreate?: () => void;
  getLessons: () => void;
};

export const LessonsList: FC<TProps> = ({
  lessons,
  canCreateLesson,
  onPressCreate,
  getLessons,
  canAttachLesson,
}) => {
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [chosenLesson, setChosenLesson] = useState<TLesson | null>(null);
  const [attachLessonModal, setAttachLessonModal] = useState(false);
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

  const onAttachLesson = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setAttachLessonModal(true);
  }, []);

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
          <div
            className="p-4 bg-white flex items-center justify-center"
            style={{
              height: 135,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            <Button
              color="primary"
              className="w-full"
              size="lg"
              onClick={onPressCreate}
            >
              Создать урок
            </Button>
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
            onPressAttach={onAttachLesson}
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
          <AttachLessonModalForm
            isVisible={attachLessonModal}
            setIsVisible={setAttachLessonModal}
            onSuccess={() => {
              setAttachLessonModal(false);
            }}
            lesson={chosenLesson}
          />
        </>
      )}
    </div>
  );
};

import { BASE_URL, checkResponse, fetchPostJson } from "@/api";
import { ImageUpload } from "@/components/ImageUpload";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
  Image,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TLesson } from "../../types";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import Loupe from "@/assets/icons/loupe.svg";
import { arrayMoveImmutable } from "array-move";
import SortIcon from "@/assets/icons/sort.svg";
import { TCourse, useCourses } from "@/app/course/hooks/useCourses";
import { useLessons } from "../../hooks/useLessons";
import { getImageUrl } from "@/app/editor/helpers";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lessonId: number;
  chosenLesson: TLesson;
  openCourseModal?: () => void;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
  tags: string;
};

export const AttachLessonCourseModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lessonId,
  chosenLesson,
  openCourseModal,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFieldList>({
    defaultValues: {},
  });

  const { courses, getCourses } = useCourses();

  useEffect(() => {
    if (isVisible) {
      getCourses();
    }
  }, [isVisible, getCourses]);

  const [isLoading, setIsLoading] = useState(false);
  const [chosenCourseIds, setChosenCourseIds] = useState<number[]>([]);

  const onSubmit = useCallback(
    async (_data) => {
      setIsLoading(true);

      try {
        const courseRes = await fetchPostJson({
          path: "/course/add-lesson",
          isSecure: true,
          data: {
            ..._data,
            courses_ids: JSON.stringify(chosenCourseIds || []),
            lesson_id: lessonId,
          },
        });
        const course = await courseRes.json();
        setIsLoading(false);
        if (course.success) {
          onSuccess();
        }
        checkResponse(course);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    },
    [chosenCourseIds, lessonId, onSuccess],
  );

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      style={{ backgroundColor: "#F9F9F9" }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          <>
            <ModalHeader>
              <p>
                Выберите курс, в который хотите добавить урок{" "}
                {chosenLesson?.title}
              </p>
            </ModalHeader>
            <ModalBody>
              <div style={{ maxHeight: 400, overflow: "auto" }}>
                <div className="h-5" />
                {courses?.length ? (
                  courses.map((lesson: TLesson) => {
                    const isSelected = chosenCourseIds.includes(lesson?.id);
                    return (
                      <div
                        key={lesson?.id}
                        onClick={() => {
                          setChosenCourseIds((ids) => {
                            if (ids.includes(lesson?.id)) {
                              return ids.filter((id) => id !== lesson?.id);
                            }
                            return ids.concat(lesson?.id);
                          });
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <Card
                          className="p-6 flex-row items-center gap-4 mb-4"
                          shadow="none"
                        >
                          <Checkbox
                            isSelected={isSelected}
                            style={{ pointerEvents: "none" }}
                          />
                          <div
                            style={{
                              width: 70,
                              height: 70,
                              borderRadius: 70,
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={lesson?.title}
                              src={
                                lesson?.image_path
                                  ? getImageUrl(lesson.image_path)
                                  : Bg.src
                              }
                            />
                          </div>
                          <p
                            style={{
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {lesson?.title}
                          </p>
                        </Card>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center">У вас пока нет курсов</p>
                )}
                <div className="h-5" />
              </div>

              <div className="flex flex-1 flex-col gap-4">
                {courses.length ? (
                  <Button
                    color="primary"
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Добавить
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    type="button"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    onClick={() => {
                      onSuccess?.();
                      openCourseModal?.();
                    }}
                  >
                    Создать курс
                  </Button>
                )}
              </div>
              <div className="h-10" />
            </ModalBody>
          </>
        </ModalContent>
      </form>
    </Modal>
  );
};

"use client";
import { checkResponse, fetchPostJson } from "@/api";
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
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  CSSProperties,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { TLesson } from "../../types";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import Loupe from "@/assets/icons/loupe.svg";
import DragHandleIcon from "@/assets/icons/drag_handle.svg";
import { TCourse } from "@/app/course/hooks/useCourses";
import { useLessons } from "../../hooks/useLessons";
import { AuthContext } from "@/auth";
import { getImageUrl } from "@/app/editor/helpers";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdcourseId: number) => void;
  chosenCourse?: TCourse;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
  tags: string;
};

/** Match a library lesson against a course membership row. */
const isLessonLinkedToSource = (lesson: TLesson, sourceId: number): boolean => {
  return (
    Number(lesson.id) === sourceId ||
    Number(lesson.created_from_id) === sourceId
  );
};

const SortableLessonRow: FC<{
  id: number;
  lesson: TLesson;
}> = ({ id, lesson }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    opacity: isDragging ? 0.85 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : 0,
    boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
    borderRadius: isDragging ? 12 : undefined,
    background: isDragging ? "#fff" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="flex gap-4 items-center">
        <span
          style={{
            display: "flex",
            padding: 6,
            background: "#f4f4f5",
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          <Image
            src={DragHandleIcon.src}
            alt={i18n.t("editor.dragHint")}
            style={{
              flexShrink: 0,
              width: 20,
              height: 20,
              transform: "rotate(90deg)",
              transformOrigin: "center",
            }}
          />
        </span>
        <Card
          className="p-6 flex-row items-center gap-4 mb-4 flex-1"
          shadow="none"
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 70,
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={lesson?.title}
              src={lesson?.image_path ? getImageUrl(lesson?.image_path) : Bg.src}
              style={{ maxWidth: "initial", maxHeight: "100%" }}
              draggable={false}
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
    </div>
  );
};

export const CreateCourseModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  chosenCourse,
}) => {
  const { profile } = useContext(AuthContext);
  const isAdmin = profile?.role_id === 1;
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFieldList>({
    defaultValues: {
      ...chosenCourse,
    },
  });

  const {
    lessons: allLessons,
    getLessons: getAllLessons,
    getCourseLessons,
  } = useLessons();

  const [images, setImages] = useState(
    chosenCourse?.image_path
      ? [
          {
            dataURL: getImageUrl(chosenCourse?.image_path),
          },
        ]
      : [],
  );
  const { uploadImages } = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(0);
  // Ordered unique course membership — always keyed by lesson.id (never created_from_id).
  const [orderedLessons, setOrderedLessons] = useState<TLesson[]>([]);
  const [lessonsSearchString, setLessonsSearchString] = useState("");
  const loadRequestIdRef = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredLessons = useMemo(() => {
    return (allLessons || []).filter((l) =>
      isAdmin ? l.user_id === 1 : l.user_id !== 1,
    );
  }, [allLessons, isAdmin]);

  const sortableIds = useMemo(
    () => orderedLessons.map((lesson) => Number(lesson.id)),
    [orderedLessons],
  );

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      setOrderedLessons([]);
      setLessonsSearchString("");
      loadRequestIdRef.current += 1;
      return;
    }

    getAllLessons();

    if (!chosenCourse?.id) {
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    (async () => {
      const data = await getCourseLessons(chosenCourse.id);
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      const lessons: TLesson[] = data?.lessons || [];
      // Keep unique course lesson rows as-is — id is the only stable identity.
      setOrderedLessons(lessons.filter((l) => l?.id != null));
    })();
  }, [isVisible, chosenCourse?.id, getAllLessons, getCourseLessons]);

  const searchedLessons = useMemo(() => {
    if (!lessonsSearchString) {
      return filteredLessons;
    }

    return filteredLessons.filter((f) => {
      return f.title.toLowerCase().includes(lessonsSearchString.toLowerCase());
    });
  }, [lessonsSearchString, filteredLessons]);

  const isSourceSelected = useCallback(
    (sourceId: number) =>
      orderedLessons.some((lesson) => isLessonLinkedToSource(lesson, sourceId)),
    [orderedLessons],
  );

  const toggleSourceLesson = useCallback((libraryLesson: TLesson) => {
    const sourceId = Number(libraryLesson.id);
    setOrderedLessons((prev) => {
      const alreadySelected = prev.some((lesson) =>
        isLessonLinkedToSource(lesson, sourceId),
      );
      if (alreadySelected) {
        return prev.filter(
          (lesson) => !isLessonLinkedToSource(lesson, sourceId),
        );
      }
      return prev.concat(libraryLesson);
    });
  }, []);

  const onSubmit = useCallback(
    async (_data) => {
      if (step === 0) {
        setStep(1);
        return;
      }

      if (step === 1 && orderedLessons.length) {
        setStep(2);
        return;
      }

      setIsLoading(true);

      const imagesToUpload = images.filter(
        (image) =>
          !!image?.file ||
          !image.dataURL.includes(
            "608dfa18-3eae-4574-a997-0a7441c16d33.selstorage.ru",
          ),
      );
      let attachments;
      if (imagesToUpload?.length) {
        attachments = await uploadImages(imagesToUpload);
      }

      // Persist unique lesson row ids in current order.
      // Backend keeps existing course lessons by id; clones library ids when needed.
      const lessonIdsToSave = orderedLessons.map((lesson) => Number(lesson.id));

      try {
        const courseRes = await fetchPostJson({
          path: chosenCourse?.id ? "/course/edit" : "/course/create",
          isSecure: true,
          data: {
            ..._data,
            image_id: attachments?.attachments?.[0]?.id,
            lesson_ids: JSON.stringify(lessonIdsToSave),
          },
        });
        const course = await courseRes.json();
        setIsLoading(false);
        if (course.success) {
          onSuccess(course.createdCourse.id);
        }
        checkResponse(course);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    },
    [step, orderedLessons, images, uploadImages, chosenCourse?.id, onSuccess],
  );

  const title = watch("title");

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedLessons((items) => {
      const oldIndex = items.findIndex(
        (lesson) => Number(lesson.id) === Number(active.id),
      );
      const newIndex = items.findIndex(
        (lesson) => Number(lesson.id) === Number(over.id),
      );
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return items;
      }
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      style={{ backgroundColor: step !== 0 ? "#F9F9F9" : "#fff" }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent>
          {step === 0 && (
            <>
              <ModalHeader>
                <p>{title ? title : <T k="modals.newCourse" />}</p>
              </ModalHeader>
              <ModalBody>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: i18n.t("profile.titleRequired") }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={<T k="editor.titleLabel" />}
                      className="mb-5"
                      radius="sm"
                      size="lg"
                      errorMessage={errors?.title?.message}
                      isInvalid={!!errors.title?.message}
                    />
                  )}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label={<T k="editor.description" />}
                      minRows={3}
                      className="mb-5"
                      radius="sm"
                      size="lg"
                      errorMessage={errors?.description?.message}
                      isInvalid={!!errors.description?.message}
                    />
                  )}
                />
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label={<T k="editor.level" />}
                      className="mb-5"
                      radius="sm"
                      size="lg"
                      errorMessage={errors?.tags?.message}
                      isInvalid={!!errors.tags?.message}
                    />
                  )}
                />
                <div className="h-5" />
                <div className="flex gap-5 items-end">
                  <ImageUpload
                    label={<T k="editor.courseCover" />}
                    images={images}
                    setImages={setImages}
                  />
                </div>
                <div className="h-5" />
                <Button
                  color="primary"
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  <T k="modals.next" />
                </Button>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
          {step === 1 && (
            <>
              <ModalHeader>
                <p>
                  <T k="modals.selectLessonsForCourse" values={{ title }} />
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="w-[100%] lg:w-[525px] m-auto">
                  <Input
                    value={lessonsSearchString}
                    onValueChange={setLessonsSearchString}
                    placeholder={i18n.t("lessons.searchLessons")}
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
                <div style={{ maxHeight: 400, overflow: "auto" }}>
                  <div className="h-5" />
                  {searchedLessons.map((lesson: TLesson) => {
                    const isSelected = isSourceSelected(Number(lesson.id));
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => toggleSourceLesson(lesson)}
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
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={lesson?.title}
                              src={
                                lesson?.image_path
                                  ? getImageUrl(lesson?.image_path)
                                  : Bg.src
                              }
                              style={{ maxWidth: "initial", maxHeight: "100%" }}
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
                  })}
                  <div className="h-5" />
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <Button
                    color="primary"
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {orderedLessons.length
                      ? <T k="modals.next" />
                      : <T k="modals.skipLessonChoice" />}
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setStep((s) => s - 1)}
                  >
                  <T k="common.back" />
                  </Button>
                </div>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
          {step === 2 && (
            <>
              <ModalHeader>
              <p className="whitespace-pre-line">
                <T k="modals.reorderLessonsHint" />
              </p>
              </ModalHeader>
              <ModalBody>
                <div
                  style={{
                    maxHeight: 400,
                    overflow: "auto",
                    position: "relative",
                  }}
                >
                  <div className="h-5" />
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortableIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {orderedLessons.map((lesson) => (
                        <SortableLessonRow
                          key={lesson.id}
                          id={Number(lesson.id)}
                          lesson={lesson}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <div className="h-5" />
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <Button
                    color="primary"
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {orderedLessons.length
                      ? <T k="modals.next" />
                      : <T k="modals.skipLessonChoice" />}
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setStep((s) => s - 1)}
                  >
                  <T k="common.back" />
                  </Button>
                </div>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </form>
    </Modal>
  );
};

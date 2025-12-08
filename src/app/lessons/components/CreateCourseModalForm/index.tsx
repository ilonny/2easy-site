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
import {
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
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import SortIcon from "@/assets/icons/sort.svg";
import { TCourse } from "@/app/course/hooks/useCourses";
import { useLessons } from "../../hooks/useLessons";
import { AuthContext } from "@/auth";

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

const SortableContainer = sortableContainer(({ children }) => {
  return <div style={{ position: "relative", zIndex: 9999 }}>{children}</div>;
});

export const CreateCourseModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  chosenCourse,
}) => {
  const { profile, authIsLoading } = useContext(AuthContext);
  const isAdmin = profile?.role_id === 1;
  console.log("profile?", profile);
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
    courseLessons,
    getCourseLessons,
  } = useLessons();

  useEffect(() => {
    if (isVisible) {
      getAllLessons();
      if (chosenCourse?.id) {
        getCourseLessons(chosenCourse.id);
      }
    }
  }, [getAllLessons, isVisible, chosenCourse?.id]);

  const filteredLessons = useMemo(() => {
    return (allLessons || []).filter((l) =>
      isAdmin ? l.user_id === 1 : l.user_id !== 1
    );
  }, [allLessons, isAdmin]);

  console.log("isAdmin?", isAdmin);

  const [images, setImages] = useState(
    chosenCourse?.image_path
      ? [
          {
            dataURL: BASE_URL + "/" + chosenCourse?.image_path,
          },
        ]
      : []
  );
  const { uploadImages } = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(0);
  const [chosenLessonIds, setChosenLessonIds] = useState<number[]>([]);
  const [lessonsSearchString, setLessonsSearchString] = useState("");

  useEffect(() => {
    setChosenLessonIds(courseLessons.map((c) => c.created_from_id || c.id));
  }, [courseLessons]);

  const modalContentRef = useRef(null);

  const searchedLessons = useMemo(() => {
    if (!lessonsSearchString) {
      return filteredLessons;
    }

    return filteredLessons.filter((f) => {
      return f.title.toLowerCase().includes(lessonsSearchString.toLowerCase());
    });
  }, [lessonsSearchString, filteredLessons]);

  const onSubmit = useCallback(
    async (_data) => {
      if (step === 0) {
        setStep(1);
        return;
      }

      if (step === 1 && chosenLessonIds.length) {
        setStep(2);
        return;
      }

      setIsLoading(true);

      const imagesToUpload = images.filter((image) => !!image?.file);
      let attachments;
      if (imagesToUpload?.length) {
        attachments = await uploadImages(imagesToUpload);
      }

      try {
        const courseRes = await fetchPostJson({
          path: chosenCourse?.id ? "/course/edit" : "/course/create",
          isSecure: true,
          data: {
            ..._data,
            image_id: attachments?.attachments?.[0]?.id,
            lesson_ids: JSON.stringify(chosenLessonIds || []),
          },
        });
        const course = await courseRes.json();
        setIsLoading(false);
        console.log("course?", course);
        if (course.success) {
          onSuccess(course.createdCourse.id);
        }
        checkResponse(course);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    },
    [step, chosenLessonIds, images, uploadImages, chosenCourse?.id, onSuccess]
  );

  const title = watch("title");

  const SortableItem = sortableElement(({ lesson }: { lesson: TLesson }) => {
    return (
      <div
        style={{ cursor: "grab", userSelect: "none" }}
        className="flex gap-4 items-center"
      >
        <Image
          src={SortIcon.src}
          alt="sort"
          style={{ flexShrink: 0, width: 25, height: 25 }}
        />
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
              src={
                lesson?.image_path
                  ? BASE_URL + "/" + lesson?.image_path
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
  });

  const sortedLessons: TLesson[] = useMemo(() => {
    return (chosenLessonIds.map((lessonId) => {
      return (
        filteredLessons.find((l) => l.id === lessonId) ||
        courseLessons?.find(
          (courseLesson) =>
            courseLesson.created_from_id == lessonId ||
            courseLesson.id == lessonId
        )
      );
    }, []) || []) as TLesson[];
  }, [chosenLessonIds, filteredLessons, courseLessons]);

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
    }
  }, [isVisible]);

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
                <p>{title ? title : "Новый курс"}</p>
              </ModalHeader>
              <ModalBody>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Название обязательное поле" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Название*"
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
                      label="Описание"
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
                      label="Уровень"
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
                    label="Обложка курса"
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
                  Дальше
                </Button>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
          {step === 1 && (
            <>
              <ModalHeader>
                <p>{`Выберите уроки, которые хотите добавить в курс «${title}»`}</p>
              </ModalHeader>
              <ModalBody>
                <div className="w-[100%] lg:w-[525px] m-auto">
                  <Input
                    value={lessonsSearchString}
                    onValueChange={setLessonsSearchString}
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
                <div style={{ maxHeight: 400, overflow: "auto" }}>
                  <div className="h-5" />
                  {searchedLessons.map((lesson: TLesson) => {
                    const isSelected = chosenLessonIds.includes(lesson?.id);
                    return (
                      <div
                        key={lesson?.id}
                        onClick={() => {
                          setChosenLessonIds((ids) => {
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
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={lesson?.title}
                              src={
                                lesson?.image_path
                                  ? BASE_URL + "/" + lesson?.image_path
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
                    {chosenLessonIds.length
                      ? "Дальше"
                      : "Пропустить выбор уроков"}
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Назад
                  </Button>
                </div>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
          {step === 2 && (
            <>
              <ModalHeader>
                <p>{`Чтобы изменить очередность уроков
в курсе, расставьте их в нужном порядке`}</p>
              </ModalHeader>
              <ModalBody>
                <div className="w-[100%] lg:w-[525px] m-auto">
                  <Input
                    value={lessonsSearchString}
                    onValueChange={setLessonsSearchString}
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
                <div
                  style={{
                    maxHeight: 400,
                    overflow: "auto",
                    position: "relative",
                    zIndex: 100000,
                  }}
                  ref={modalContentRef}
                >
                  <div className="h-5" />
                  <SortableContainer
                    helperContainer={modalContentRef.current}
                    onSortEnd={({ oldIndex, newIndex }) => {
                      setChosenLessonIds((ids) =>
                        arrayMoveImmutable(ids, oldIndex, newIndex)
                      );
                    }}
                  >
                    {sortedLessons.map((lesson: TLesson, index) => {
                      return (
                        <SortableItem
                          lesson={lesson}
                          key={lesson?.id}
                          index={index}
                        />
                      );
                    })}
                  </SortableContainer>
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
                    {chosenLessonIds.length
                      ? "Дальше"
                      : "Пропустить выбор уроков"}
                  </Button>
                  <Button
                    color="secondary"
                    variant="flat"
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Назад
                  </Button>
                </div>
                <div className="h-10" />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </form>
      {/* <Button
        color="primary"
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        Создать курс
      </Button> */}
    </Modal>
  );
};

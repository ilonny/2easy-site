"use client";
import { checkResponse, fetchPostJson } from "@/api";
import { TCourse } from "@/app/course/hooks/useCourses";
import { ImageUpload } from "@/components/ImageUpload";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { Tag, TagInput } from "emblor";
import { FC, useCallback, useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { CreateLessonWithAiModal } from "../CreateLessonWithAiModal";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { canUseAi } from "@/app/ai/canUseAi";
import { AuthContext } from "@/auth";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdLessonId: number) => void;
  currentCourse?: TCourse;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
  tags: string;
};

export const CreateLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  currentCourse,
}) => {
  const { profile } = useContext(AuthContext);
  const { requireAiSubscription } = useCheckSubscription();
  const showAi = canUseAi(profile);
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TFieldList>({
    defaultValues: {
      title: "",
    },
  });

  const [images, setImages] = useState([]);
  const { uploadImages } = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const onSubmit = useCallback(
    async (_data) => {
      let attachments;
      setIsLoading(true);
      if (images?.length) {
        attachments = await uploadImages(images);
      }

      // const tagsArr = (_data?.tags || [])?.map((t) => (t.text ? t.text : ""));
      try {
        const lessonRes = await fetchPostJson({
          path: "/lesson/create-lesson",
          isSecure: true,
          data: {
            ..._data,
            // tags: tagsArr?.join?.(",") || "",
            image_id: attachments?.attachments?.[0]?.id,
            course_id: currentCourse?.id,
          },
        });
        const lesson = await lessonRes.json();
        setIsLoading(false);
        if (lesson.success) {
          window?.ym(103955671, "reachGoal", "lesson-create");
          onSuccess(lesson.createdLesson.id);
        }
        checkResponse(lesson);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    },
    [images, uploadImages, currentCourse?.id, onSuccess],
  );

  const title = watch("title");

  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <>
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : <T k="modals.newLesson" />}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
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
            {/* <Controller
              name="student_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label={i18n.t("modals.addLessonToGroup")}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.student_id?.message}
                  isInvalid={!!errors.student_id?.message}
                >
                  <SelectItem key={"qq"} value={"qqqq"} title="Qq" />
                </Select>
              )}
            /> */}
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
            <div className="flex gap-5 items-end w-full">
              <ImageUpload
                label={<T k="editor.lessonCover" />}
                images={images}
                setImages={setImages}
                withInternetSearch
                fullWidth
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
              <T k="lessons.createLesson" />
            </Button>
            {showAi && (
              <>
                <div className="h-3" />
                <Button
                  variant="bordered"
                  className="w-full"
                  size="lg"
                  type="button"
                  onPress={() => {
                    if (!requireAiSubscription()) return;
                    setIsVisible(false);
                    setAiModalVisible(true);
                  }}
                >
                  <T
                    k="ai.createWithAi"
                    defaultText="Создать урок с помощью AI"
                  />
                </Button>
              </>
            )}
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
    {showAi && (
      <CreateLessonWithAiModal
        isVisible={aiModalVisible}
        setIsVisible={setAiModalVisible}
        onSuccess={onSuccess}
        currentCourse={currentCourse}
      />
    )}
    </>
  );
};

import { BASE_URL, checkResponse, fetchPostJson } from "@/api";
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
import { FC, useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TLesson } from "../../types";
import { getImageUrl } from "@/app/editor/helpers";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
  tags: Tag[];
};

export const EditLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lesson,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TFieldList>({
    defaultValues: {
      ...lesson,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState(
    lesson?.image_path
      ? [
          {
            dataURL: getImageUrl(lesson?.image_path),
          },
        ]
      : [],
  );
  const { uploadImages } = useUploadImage();

  const onSubmit = useCallback(
    async (_data) => {
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
      try {
        const lessonRes = await fetchPostJson({
          path: "/lesson/edit-lesson",
          isSecure: true,
          data: {
            ..._data,
            image_id: attachments?.attachments?.[0]?.id,
          },
        });
        const lesson = await lessonRes.json();
        setIsLoading(false);
        if (lesson.success) {
          onSuccess();
        }
        checkResponse(lesson);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    },
    [images, uploadImages, onSuccess],
  );

  const title = watch("title");

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : "Новый урок"}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  minRows={3}
                  label="Описание"
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
                  label="Добавить урок в группу / ученику:"
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
                // initialImages=[]
                label="Обложка урока"
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
              Подтвердить
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

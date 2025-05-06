import { fetchPostJson } from "@/api";
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

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdLessonId: number) => void;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
  tags: Tag[];
};

export const CreateLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
}) => {
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

  const onSubmit = useCallback(
    async (_data) => {
      let attachments;
      setIsLoading(true);
      if (images?.length) {
        attachments = await uploadImages(images);
      }

      const tagsArr = (_data?.tags || [])?.map((t) => (t.text ? t.text : ""));
      const lessonRes = await fetchPostJson({
        path: "/lesson/create-lesson",
        isSecure: true,
        data: {
          ..._data,
          tags: tagsArr?.join?.(",") || "",
          image_id: attachments?.attachments?.[0]?.id,
        },
      });
      const lesson = await lessonRes.json();
      setIsLoading(false);
      if (lesson.success) {
        onSuccess(lesson.createdLesson.id);
      }
    },
    [images, uploadImages, onSuccess]
  );

  const title = watch("title");

  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

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
                <TagInput
                  {...field}
                  placeholder="Теги (видны только вам, вводить через enter)"
                  styleClasses={{
                    inlineTagsContainer: "p-0 h-15",
                    input: "h-16 bg-default-100",
                    tag: {
                      body: "pl-2",
                    },
                    tagList: {
                      container: "bg-default-100 pl-2",
                      sortableList: "bg-default-100 pl-2",
                    },
                    tagPopover: {
                      popoverContent: "bg-default-100 pl-2",
                    },
                  }}
                  tags={tags}
                  setTags={(newTags) => {
                    setTags(newTags);
                    setValue("tags", newTags as [Tag, ...Tag[]]);
                  }}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                />
              )}
            />
            <div className="h-5" />
            <div className="flex gap-5 items-end">
              <ImageUpload
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
              Создать урок
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

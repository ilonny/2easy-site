"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { ImageUpload } from "@/components/ImageUpload";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdBoardId: number) => void;
};

type TFieldList = {
  title: string;
  description: string;
  tags: string;
};

export const CreateBoardModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TFieldList>({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const [images, setImages] = useState([]);
  const { uploadImages } = useUploadImage();
  const [isLoading, setIsLoading] = useState(false);
  const title = watch("title");

  useEffect(() => {
    if (!isVisible) {
      reset({ title: "", description: "", tags: "" });
      setImages([]);
    }
  }, [isVisible, reset]);

  const onSubmit = useCallback(
    async (data: TFieldList) => {
      setIsLoading(true);
      try {
        let attachments;
        if (images?.length) {
          attachments = await uploadImages(images);
        }

        const res = await fetchPostJson({
          path: "/board/create",
          isSecure: true,
          data: {
            ...data,
            image_id: attachments?.attachments?.[0]?.id,
          },
        });
        const json = await res.json();
        if (json.success) {
          onSuccess(json.createdBoard.id);
        }
        checkResponse(json);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [images, onSuccess, uploadImages],
  );

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
    >
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : <T k="boards.newBoard" />}</p>
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
                />
              )}
            />
            <div className="h-5" />
            <ImageUpload
              label={<T k="boards.cover" />}
              images={images}
              setImages={setImages}
              withInternetSearch
              fullWidth
            />
            <div className="h-5" />
            <Button
              color="primary"
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              <T k="boards.createBoard" />
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

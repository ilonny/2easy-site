"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { getImageUrl } from "@/app/editor/helpers";
import { TBoard, TBoardFormFields } from "@/app/board/types";
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
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  board: TBoard;
};

export const EditBoardModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  board,
}) => {
  const { profile } = useContext(AuthContext);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<TBoardFormFields>({
    defaultValues: {
      title: board?.title || "",
      description: board?.description || "",
      tags: board?.tags || "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState(
    board?.image_path
      ? [{ dataURL: getImageUrl(board.image_path) }]
      : [],
  );
  const { uploadImages } = useUploadImage();
  const title = watch("title");

  useEffect(() => {
    if (!isVisible || !board) return;
    reset({
      title: board.title || "",
      description: board.description || "",
      tags: board.tags || "",
    });
    setImages(
      board.image_path ? [{ dataURL: getImageUrl(board.image_path) }] : [],
    );
  }, [board, isVisible, reset]);

  const onSubmit = useCallback(
    async (data: TBoardFormFields) => {
      setIsLoading(true);
      try {
        const imagesToUpload = images.filter((image) => !!image?.file);
        let attachments;
        if (imagesToUpload?.length) {
          attachments = await uploadImages(imagesToUpload);
        }

        const res = await fetchPostJson({
          path: "/board/edit",
          isSecure: true,
          data: {
            ...data,
            id: board.id,
            user_id: profile?.id,
            image_id: attachments?.attachments?.[0]?.id ?? board.image_id,
          },
        });
        const json = await res.json();
        if (json.success) {
          onSuccess();
        }
        checkResponse(json);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [board.id, board.image_id, images, onSuccess, profile?.id, uploadImages],
  );

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : <T k="boards.editBoard" />}</p>
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
              <T k="common.save" />
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

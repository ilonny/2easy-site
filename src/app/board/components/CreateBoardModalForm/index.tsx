"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { toast } from "react-toastify";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TBoardFormFields } from "@/app/board/types";
import { BOARD_MODAL_CLASS_NAMES } from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardFormFields } from "@/app/board/components/BoardFormFields";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { ImageListType } from "react-images-uploading";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdBoardId: number) => void;
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
  } = useForm<TBoardFormFields>({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const [images, setImages] = useState<ImageListType>([]);
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
    async (data: TBoardFormFields) => {
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
      } catch {
        toast(i18n.t("boards.saveError"), { type: "error" });
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
      closeButton={<BoardCloseButton />}
      classNames={BOARD_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : <T k="boards.newBoard" />}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <BoardFormFields
              control={control}
              errors={errors}
              images={images}
              setImages={setImages}
              showCoverSpacer
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

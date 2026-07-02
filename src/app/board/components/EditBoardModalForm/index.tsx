"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { getImageUrl } from "@/app/editor/helpers";
import { TBoard, TBoardFormFields } from "@/app/board/types";
import { resolveBoardCoverImageId } from "@/app/board/utils/coverImage";
import { BOARD_MODAL_CLASS_NAMES } from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { BoardFormFields } from "@/app/board/components/BoardFormFields";
import { useUploadImage } from "@/hooks/useUploadImage";
import { toast } from "react-toastify";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { ImageListType } from "react-images-uploading";

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
  const [images, setImages] = useState<ImageListType>(
    board?.image_path
      ? [
          {
            dataURL: getImageUrl(board.image_path),
            id: board.image_id,
          },
        ]
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
      board.image_path
        ? [
            {
              dataURL: getImageUrl(board.image_path),
              id: board.image_id,
            },
          ]
        : [],
    );
  }, [board, isVisible, reset]);

  const onSubmit = useCallback(
    async (data: TBoardFormFields) => {
      setIsLoading(true);
      try {
        const imageId = await resolveBoardCoverImageId(
          images,
          board.image_id,
          uploadImages,
        );

        const res = await fetchPostJson({
          path: "/board/edit",
          isSecure: true,
          data: {
            ...data,
            id: board.id,
            user_id: profile?.id,
            image_id: imageId,
          },
        });
        const json = await res.json();
        if (json.success) {
          onSuccess();
        }
        checkResponse(json);
      } catch {
        toast(i18n.t("boards.saveError"), { type: "error" });
      } finally {
        setIsLoading(false);
      }
    },
    [board.id, board.image_id, images, onSuccess, profile?.id, uploadImages],
  );

  return (
    <Modal
      size="full"
      radius="none"
      placement="center"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="inside"
      closeButton={<BoardCloseButton />}
      classNames={BOARD_MODAL_CLASS_NAMES}
    >
      <ModalContent className="h-full max-h-[100dvh] rounded-none flex flex-col">
        <ModalHeader>
          <p>{title ? title : <T k="boards.editBoard" />}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <BoardFormFields
              control={control}
              errors={errors}
              images={images}
              setImages={setImages}
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

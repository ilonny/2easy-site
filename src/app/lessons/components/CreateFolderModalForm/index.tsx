"use client";

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
import { ImageListType } from "react-images-uploading";
import { ImageUpload } from "@/components/ImageUpload";
import { useUploadImage } from "@/hooks/useUploadImage";
import { getImageUrl } from "@/app/editor/helpers";
import { T } from "@/i18n/T";
import { TCatalogFolder } from "../../hooks/useCatalog";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSubmitFolder: (data: {
    id?: number;
    title: string;
    description?: string;
    tags?: string;
    image_id?: string | number;
  }) => Promise<void> | void;
  folder?: TCatalogFolder | null;
};

type TFieldList = {
  title: string;
  description: string;
  tags: string;
};

const SELSTORAGE_HOST = "608dfa18-3eae-4574-a997-0a7441c16d33.selstorage.ru";

export const CreateFolderModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSubmitFolder,
  folder,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TFieldList>({
    defaultValues: { title: "", description: "", tags: "" },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageListType>([]);
  const { uploadImages } = useUploadImage();

  useEffect(() => {
    if (!isVisible) return;
    reset({
      title: folder?.title || "",
      description: folder?.description || "",
      tags: folder?.tags || "",
    });
    setImages(
      folder?.image_path
        ? [{ dataURL: getImageUrl(folder.image_path) }]
        : [],
    );
  }, [folder, isVisible, reset]);

  const onSubmit = useCallback(
    async (data: TFieldList) => {
      setIsLoading(true);
      try {
        const imagesToUpload = images.filter(
          (image) =>
            !!image?.file ||
            (!!image?.dataURL && !String(image.dataURL).includes(SELSTORAGE_HOST)),
        );
        let image_id: string | number | undefined;
        if (imagesToUpload.length) {
          const attachments = await uploadImages(imagesToUpload);
          image_id = attachments?.attachments?.[0]?.id;
        }

        await onSubmitFolder({
          id: folder?.id,
          title: data.title,
          description: data.description,
          tags: data.tags,
          ...(image_id != null ? { image_id } : {}),
        });
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    },
    [folder?.id, images, onSubmitFolder, setIsVisible, uploadImages],
  );

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        // Above sticky/fixed header (z-60 on mobile); NextUI default is z-50.
        wrapper: "site-overlay-layer items-center p-2 sm:p-4",
        backdrop: "site-overlay-layer",
        base: "mx-0 my-auto max-h-[min(90dvh,720px)] w-full max-w-[calc(100vw-1rem)] rounded-[20px] bg-white sm:max-w-xl lg:rounded-[30px]",
        header: "shrink-0 border-b border-black/5 font-medium text-brand-black",
        body: "overflow-y-auto overscroll-contain",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            {folder ? <T k="lessons.editFolder" /> : <T k="lessons.createFolder" />}
          </p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="title"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<T k="lessons.folderName" />}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  isInvalid={!!errors.title}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label={<T k="lessons.folderDescription" />}
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
                  label={<T k="lessons.folderTag" />}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                />
              )}
            />
            <div className="mb-5 flex w-full items-end gap-5">
              <ImageUpload
                label={<T k="lessons.folderCover" />}
                images={images}
                setImages={setImages}
                withInternetSearch
                fullWidth
              />
            </div>
            <Button
              color="primary"
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {folder ? <T k="common.save" /> : <T k="lessons.createFolder" />}
            </Button>
            <div className="h-2" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

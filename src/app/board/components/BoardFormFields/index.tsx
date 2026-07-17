"use client";

import { ImageUpload } from "@/components/ImageUpload";
import { Input, Textarea } from "@nextui-org/react";
import { FC } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ImageListType } from "react-images-uploading";
import { TBoardFormFields } from "@/app/board/types";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  control: Control<TBoardFormFields>;
  errors: FieldErrors<TBoardFormFields>;
  images: ImageListType;
  setImages: (images: ImageListType) => void;
  showCoverSpacer?: boolean;
};

export const BoardFormFields: FC<TProps> = ({
  control,
  errors,
  images,
  setImages,
  showCoverSpacer = false,
}) => (
  <>
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
    {showCoverSpacer ? <div className="h-5" /> : null}
    <ImageUpload
      label={<T k="boards.cover" />}
      images={images}
      setImages={setImages}
      withInternetSearch
      fullWidth
    />
  </>
);

"use client";
import { useTranslation } from "react-i18next";
import { checkResponse, fetchPostJson } from "@/api";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
};

type TFieldList = {
  name: string;
  tag: string;
};

export const CreateGroupModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFieldList>();

  const onSubmit = useCallback(
    async (_data) => {
      const lessonRes = await fetchPostJson({
        path: "/group/create",
        isSecure: true,
        data: {
          ..._data,
        },
      });
      const lesson = await lessonRes.json();
      if (lesson.success) {
        onSuccess();
      }
      checkResponse(lesson);
    },
    [onSuccess]
  );

  const title = watch("name");

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : t("modals.newGroup")}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              rules={{ required: t("profile.titleRequired") }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("editor.titleLabel")}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.name?.message}
                  isInvalid={!!errors.name?.message}
                />
              )}
            />
            <Controller
              name="tag"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t("editor.description")}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.tag?.message}
                  isInvalid={!!errors.tag?.message}
                />
              )}
            />
            <div className="h-5" />
            <Button color="primary" type="submit" className="w-full" size="lg">
              {t("lessons.createGroup")}
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

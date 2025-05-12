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
          <p>{title ? title : "Новая группа"}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Название обязательное поле" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Название*"
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
                  label="Описание"
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
              Создать группу
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

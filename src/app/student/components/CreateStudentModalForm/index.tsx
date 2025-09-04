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
  chosenStudent?: any;
};

type TFieldList = {
  name: string;
  email: string;
  tag: string;
};

export const CreateStudentModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  chosenStudent,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TFieldList>({
    defaultValues: chosenStudent ? chosenStudent : {},
  });

  const onSubmit = useCallback(
    async (_data) => {
      const lessonRes = await fetchPostJson({
        path: _data?.id ? "/student/edit" : "/student/create",
        isSecure: true,
        data: {
          ..._data,
        },
      });
      const lesson = await lessonRes.json();
      if (lesson.success) {
        window?.ym(103955671, "reachGoal", "student-create");
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
          <p>{title ? title : "Новый ученик"}</p>
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
                  label="ФИО*"
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.name?.message}
                  isInvalid={!!errors.name?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{ required: "E-mail обязательное поле" }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="E-mail*"
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.email?.message}
                  isInvalid={!!errors.email?.message}
                  description="На указанный e-mail придут данные для входа в личный кабинет"
                />
              )}
            />
            <Controller
              name="tag"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Заметка (например, уровень подготовки)"
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
              {chosenStudent?.id ? "Сохранить" : "Добавить ученика"}
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

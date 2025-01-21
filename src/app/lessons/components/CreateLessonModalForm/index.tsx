import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FC, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
};

type TFieldList = {
  title: string;
  description: string;
  student_id: string;
};

export const CreateLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<TFieldList>({
    defaultValues: {
      title: "",
    },
  });

  const onSubmit = useCallback((_data) => {
    console.log("onSubmit", _data);
  }, []);

  const title = watch("title");

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
                <Input
                  {...field}
                  label="Описание"
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.title?.message}
                  isInvalid={!!errors.title?.message}
                />
              )}
            />
            <Controller
              name="student_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Добавить урок в группу / ученику:"
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.title?.message}
                  isInvalid={!!errors.title?.message}
                >
                  <SelectItem key={"qq"} value={"qqqq"} title="Qq" />
                </Select>
              )}
            />
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

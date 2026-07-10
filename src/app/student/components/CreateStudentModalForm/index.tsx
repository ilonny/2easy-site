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
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { isOutlookEmail } from "@/utils/isOutlookEmail";
import { toast } from "react-toastify";

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
          email: _data.email?.trim(),
        },
      });
      const lesson = await lessonRes.json();
      if (lesson.success) {
        window?.ym(103955671, "reachGoal", "student-create");
        if (!_data?.id) {
          toast(i18n.t("students.credentialsSent"), { type: "success" });
        }
        onSuccess();
      } else {
        checkResponse(lesson);
      }
    },
    [onSuccess]
  );

  const title = watch("name");

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>{title ? title : <T k="students.newStudent" />}</p>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              rules={{ required: i18n.t("students.nameRequired") }}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<T k="students.fullName" />}
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
              rules={{
                required: i18n.t("auth.emailRequired"),
                validate: (value) =>
                  isOutlookEmail(value)
                    ? i18n.t("auth.outlookEmailBlocked")
                    : true,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="E-mail*"
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  errorMessage={errors?.email?.message}
                  isInvalid={!!errors.email?.message}
                  description={<T k="students.emailHint" />}
                />
              )}
            />
            <Controller
              name="tag"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={<T k="students.noteLabel" />}
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
              {chosenStudent?.id ? <T k="common.save" /> : <T k="students.addStudent" />}
            </Button>
            <div className="h-10" />
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

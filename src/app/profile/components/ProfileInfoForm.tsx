import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProfileImagePicker } from "./ProfileImagePicker";
import { AuthContext } from "@/auth";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { ChangePasswordForm } from "@/app/login/components/ChangePasswordForm";
import { SubscribeCancel } from "@/subscribe/components/SubscribeCancel";

type TFieldList = {
  name: string;
  login: string;
  phone: string;
  promocode: string;
  password: string;
};

export const ProfileInfoForm = () => {
  const { t } = useTranslation();
  const { profile } = useContext(AuthContext);
  const [changePasswordIsVisible, setChangePasswordIsVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<TFieldList>({
    defaultValues: {
      login: profile?.login || "",
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  const onSubmit = useCallback((_data) => {}, []);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start w-full max-w-full min-w-0">
        <div className="flex justify-center w-full lg:w-auto shrink-0">
          <ProfileImagePicker />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-full lg:min-w-0 lg:flex-1 lg:max-w-[min(100%,520px)]"
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: t("profile.nameRequired") }}
            render={({ field }) => (
              <Input
                {...field}
                label={t("profile.name")}
                className="mb-5"
                radius="sm"
                size="lg"
                errorMessage={errors?.name?.message}
                isInvalid={!!errors.name?.message}
                variant="bordered"
                labelPlacement="outside"
                color="primary"
                isReadOnly
              />
            )}
          />
          <div className="h-2" />
          <Controller
            name="login"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                isDisabled
                label="E-mail"
                className="mb-5"
                radius="sm"
                size="lg"
                variant="bordered"
                labelPlacement="outside"
                color="primary"
              />
            )}
          />
          <div className="h-2" />
          <div className="flex flex-col sm:flex-row gap-2 sm:items-baseline">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  isDisabled
                  label={t("auth.password")}
                  className="mb-5"
                  radius="sm"
                  size="lg"
                  variant="bordered"
                  labelPlacement="outside"
                  color="primary"
                  type="password"
                  value="*************"
                />
              )}
            />
            <Button
              size="lg"
              type="button"
              className="text-small bg-black text-white"
              onClick={() => setChangePasswordIsVisible(true)}
            >
              {t("profile.change")}
            </Button>
            <Modal
              size="lg"
              isOpen={changePasswordIsVisible}
              onClose={() => setChangePasswordIsVisible(false)}
            >
              <ModalContent>
                <ModalHeader></ModalHeader>
                <ModalBody>
                  <ChangePasswordForm />
                  <div className="h-10" />
                </ModalBody>
              </ModalContent>
            </Modal>
          </div>
          <SubscribeCancel disableUppercase />
        </form>
      </div>
    </>
  );
};

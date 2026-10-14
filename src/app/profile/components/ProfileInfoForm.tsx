"use client";

import { useCallback, useContext, useEffect, useState } from "react";
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
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { checkResponse, fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";
import { toast } from "react-toastify";
import {
  brandInputClassNames,
  brandModalClassNames,
  brandPrimaryBtnClassName,
  brandSecondaryBtnClassName,
} from "@/components/brandUi";

type TFieldList = {
  name: string;
  login: string;
  password: string;
};

export const ProfileInfoForm = () => {
  const { profile, setProfile } = useContext(AuthContext);
  const isStudent = !!profile?.isStudent;
  const [changePasswordIsVisible, setChangePasswordIsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<TFieldList>({
    defaultValues: {
      login: profile?.login || profile?.email || "",
      name: profile?.name || "",
    },
  });

  useEffect(() => {
    reset({
      login: profile?.login || profile?.email || "",
      name: profile?.name || "",
    });
  }, [profile?.name, profile?.login, profile?.email, reset]);

  const onSubmit = useCallback(
    async (data: TFieldList) => {
      const name = data.name?.trim();
      if (!name) return;
      setSaving(true);
      try {
        const res = await fetchPostJson({
          path: "/profile",
          isSecure: true,
          data: { name },
        });
        const json = await res.json();
        checkResponse(json);
        if (json?.profile && setProfile) {
          setProfile(json.profile);
          writeToLocalStorage("profile", JSON.stringify(json.profile));
        }
        reset({
          login: json?.profile?.login || json?.profile?.email || data.login,
          name: json?.profile?.name || name,
        });
        toast.success(i18n.t("profile.saved"));
      } catch {
        toast.error(i18n.t("commonErrors.somethingWentWrong"));
      } finally {
        setSaving(false);
      }
    },
    [reset, setProfile],
  );

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-16">
      <div className="flex w-full shrink-0 justify-center lg:w-auto">
        <ProfileImagePicker />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-full lg:min-w-0 lg:max-w-[min(100%,520px)] lg:flex-1"
      >
        <p className="mb-5 text-sm text-default-500">
          <T k="profile.friendlyIntro" />
        </p>
        <Controller
          name="name"
          control={control}
          rules={{ required: i18n.t("profile.nameRequired") }}
          render={({ field }) => (
            <Input
              {...field}
              label={<T k="profile.name" />}
              className="mb-5"
              radius="lg"
              size="lg"
              errorMessage={errors?.name?.message}
              isInvalid={!!errors.name?.message}
              variant="flat"
              labelPlacement="outside"
              classNames={brandInputClassNames}
              placeholder={i18n.t("profile.namePlaceholder")}
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
              label={<T k="auth.email" />}
              className="mb-5"
              radius="lg"
              size="lg"
              variant="flat"
              labelPlacement="outside"
              classNames={brandInputClassNames}
            />
          )}
        />
        {!isStudent && (
          <>
            <div className="h-2" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    isDisabled
                    label={<T k="auth.password" />}
                    className="mb-5"
                    radius="lg"
                    size="lg"
                    variant="flat"
                    labelPlacement="outside"
                    classNames={brandInputClassNames}
                    type="password"
                    value="*************"
                  />
                )}
              />
              <Button
                size="lg"
                type="button"
                className={brandSecondaryBtnClassName}
                onClick={() => setChangePasswordIsVisible(true)}
              >
                <T k="profile.change" />
              </Button>
              <Modal
                size="lg"
                isOpen={changePasswordIsVisible}
                onClose={() => setChangePasswordIsVisible(false)}
                classNames={brandModalClassNames}
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
          </>
        )}
        <Button
          type="submit"
          size="lg"
          className={`mt-2 w-full min-w-[180px] sm:w-auto ${brandPrimaryBtnClassName}`}
          isLoading={saving}
          isDisabled={!isDirty || saving}
        >
          <T k="profile.save" />
        </Button>
      </form>
    </div>
  );
};

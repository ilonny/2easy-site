import { useTranslation } from "react-i18next";
import { fetchPostJson } from "@/api";
import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type TFieldList = {
  old_password: string;
  new_password: string;
  new_password_repeat: string;
};

export const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const [errorText, setErrorText] = useState("");
  const [responseError, setResponseError] = useState("");
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TFieldList>({
    defaultValues: {},
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      return fetchPostJson({
        path: "/change-password",
        data,
        isSecure: true,
      });
    },
    onMutate: () => setResponseError(""),
    onSettled: (data) => {
      data?.json().then((res) => {
        if (res.ok) {
          router.replace("/");
          return;
        }
        if (res.message) {
          setResponseError(res.message);
        }
      });
    },
  });

  const onSubmit = useCallback(
    (data: TFieldList) => {
      setErrorText("");
      setResponseError("");
      if (data.new_password !== data.new_password_repeat) {
        setErrorText(t("auth.passwordsMustMatch"));
        return;
      }
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <>
      <h3 className="text-center font-extrabold text-2xl mb-2">
        {t("profile.changePassword")}
      </h3>
      <p className="text-center mb-7 font-medium"></p>
      <form key={1} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="old_password"
          control={control}
          rules={{ required: t("auth.enterOldPassword") }}
          render={({ field }) => (
            <Input
              {...field}
              label={t("auth.oldPassword")}
              className="mb-5"
              radius="sm"
              errorMessage={errors?.old_password?.message}
              isInvalid={!!errors.old_password?.message}
              type="password"
            />
          )}
        />
        <div className="h-2" />
        <Controller
          name="new_password"
          control={control}
          rules={{ required: t("auth.enterNewPassword") }}
          render={({ field }) => (
            <Input
              {...field}
              label={t("auth.newPassword")}
              className="mb-5"
              radius="sm"
              errorMessage={errors?.new_password?.message}
              isInvalid={!!errors.new_password?.message}
              type="password"
            />
          )}
        />
        <div className="h-2" />
        <Controller
          name="new_password_repeat"
          control={control}
          rules={{ required: t("auth.repeatNewPassword") }}
          render={({ field }) => (
            <Input
              {...field}
              label={t("auth.repeatNewPassword")}
              className="mb-5"
              radius="sm"
              errorMessage={errors?.new_password_repeat?.message || errorText}
              isInvalid={!!errors.new_password_repeat?.message || !!errorText}
              type="password"
            />
          )}
        />
        <div className="h-2" />
        <div className="flex justify-center">
          <Button
            type="submit"
            color="primary"
            isLoading={mutation.isPending}
            size="lg"
          >
            {t("common.confirm")}
          </Button>
        </div>
        {responseError && (
          <>
            <div className="h-2" />
            <p className="text-small text-danger">{responseError}</p>
          </>
        )}
      </form>
    </>
  );
};

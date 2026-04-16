"use client";
import { fetchPostJson } from "@/api";
import { Button } from "@/ui";
import { Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TLoginInputs = {
  login: string;
  password: string;
};

export const RestoreForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginInputs>();

  const [responseError, setResponseError] = useState("");
  const router = useRouter();

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    mutation.mutate(data);
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      return fetchPostJson({
        path: "/reset-password",
        data,
      });
    },
    onMutate: () => setResponseError(""),
    onSettled: (data) => {
      data?.json().then((res) => {
        if (res.message) {
          setResponseError(res.message);
        }
        if (res.success) {
          router.replace("/login");
        }
      });
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-center font-bold text-2xl mb-2">
        <T k="auth.restorePasswordTitle" />
      </h3>
      <p className="text-center mb-7 font-medium">
        <T k="auth.restorePasswordLine1" />
        <br />
        <T k="auth.restorePasswordLine2" />
      </p>
      <Controller
        name="login"
        control={control}
        rules={{
          required: i18n.t("auth.emailRequired"),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: i18n.t("auth.invalidEmail"),
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            radius="sm"
            label={<T k="auth.email" />}
            className="mb-5"
            errorMessage={errors?.login?.message}
            isInvalid={!!errors.login?.message}
          />
        )}
      />
      <div className="mb-10">
        <Button
          isLoading={mutation.isPending}
          type="submit"
          text={i18n.t("auth.restorePasswordSubmit")}
          fullWidth
          mediumHeight
        />
        {!!responseError && (
          <p className="text-tiny text-danger">{responseError}</p>
        )}
      </div>
      <div className="flex justify-center items-center gap-2  font-medium text-small">
        <p><T k="auth.rememberPassword" /></p>
        <Link href="/login" className="text-[#3F28C6] underline">
          <T k="common.login" />
        </Link>
      </div>
    </form>
  );
};

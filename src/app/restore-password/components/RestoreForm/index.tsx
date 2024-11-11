"use client";
import { fetchPostJson } from "@/api";
import { Button } from "@/ui";
import { Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

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
        console.log("res?", res);
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
        Восстановление пароля
      </h3>
      <p className="text-center mb-7 font-medium">
        Введите E-mail при регистрации,
        <br />
        пришлем на него пароль
      </p>
      <Controller
        name="login"
        control={control}
        rules={{
          required: "E-mail обязательное поле",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Некорректный e-mail",
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            radius="sm"
            label="E-mail"
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
          text="Восстановить пароль"
          fullWidth
          mediumHeight
        />
        {!!responseError && (
          <p className="text-tiny text-danger">{responseError}</p>
        )}
      </div>
      <div className="flex justify-center items-center gap-2  font-medium text-small">
        <p>Вспомнили пароль?</p>
        <Link href="/login" className="text-[#3F28C6] underline">
          Войти
        </Link>
      </div>
    </form>
  );
};

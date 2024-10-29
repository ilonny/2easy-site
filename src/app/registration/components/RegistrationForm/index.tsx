"use client";
import { fetchPostJson } from "@/api";
import { AuthContext } from "@/auth";
import { writeToLocalStorage } from "@/auth/utils";
import { Button } from "@/ui";
import { Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type TLoginInputs = {
  name: string;
  login: string;
};

export const RegistrationForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginInputs>();

  const [responseError, setResponseError] = useState("");
  const { setProfile } = useContext(AuthContext);
  const router = useRouter();

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    mutation.mutate(data);
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      return fetchPostJson("/register", data);
    },
    onMutate: () => setResponseError(""),
    onSettled: (data) => {
      data?.json().then((res) => {
        console.log("res?", res);
        if (res.message) {
          setResponseError(res.message);
        }
        if (res.token) {
          writeToLocalStorage("token", res.token);
          writeToLocalStorage("profile", JSON.stringify(res));
          setProfile(res);
          router.replace("/");
        }
      });
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-center font-extrabold text-2xl mb-2">Регистрация</h3>
      <p className="text-center mb-7 font-medium">
        После создания личного кабинета начнется бесплатный пробный период (3
        дня)
      </p>
      <Controller
        name="name"
        control={control}
        rules={{ required: "Имя обязательное поле" }}
        render={({ field }) => (
          <Input
            {...field}
            label="Имя"
            className="mb-5"
            radius="sm"
            errorMessage={errors?.name?.message}
            isInvalid={!!errors.name?.message}
          />
        )}
      />
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
          text="Получить пароль"
          fullWidth
          mediumHeight
        />
        {!!responseError && (
          <p className="text-tiny text-danger">{responseError}</p>
        )}
      </div>
      <div className="flex justify-center items-center gap-2 font-medium text-small">
        <p>Уже есть подписка?</p>
        <Link href="/login" className="text-[#3F28C6] underline">
          Войти
        </Link>
      </div>
    </form>
  );
};

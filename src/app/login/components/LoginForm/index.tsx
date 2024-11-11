"use client";
import { fetchPostJson } from "@/api";
import { AuthContext } from "@/auth";
import { writeToLocalStorage } from "@/auth/utils";

import { Button, Checkbox, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type TLoginInputs = {
  login: string;
  password: string;
};

export const LoginForm = () => {
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
      return fetchPostJson({
        path: "/login",
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
      <h3 className="text-center font-bold text-2xl mb-8">Вход</h3>
      <Controller
        name="login"
        control={control}
        rules={{ required: "E-mail обязательное поле" }}
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
      <Controller
        name="password"
        control={control}
        rules={{
          required: "Пароль обязательное поле",
        }}
        render={({ field }) => (
          <Input
            {...field}
            label="Пароль"
            type="password"
            className="mb-8"
            radius="sm"
            errorMessage={errors?.password?.message}
            isInvalid={!!errors.password?.message}
          />
        )}
      />
      <div className="flex items-center justify-between mb-8">
        {/* <Checkbox size="sm" defaultSelected>
          Запомнить
        </Checkbox> */}
        <Link
          href="/restore-password"
          className="text-[#3F28C6] underline text-sm"
        >
          Забыли пароль?
        </Link>
      </div>
      <div className="mb-10">
        <Button
          isLoading={mutation.isPending}
          type="submit"
          fullWidth
          color="primary"
          size="lg"
          radius="sm"
        >
          Войти
        </Button>
        {!!responseError && (
          <p className="text-tiny text-danger">{responseError}</p>
        )}
      </div>
      <div className="flex justify-center items-center gap-2  font-medium text-small">
        <p>Нет аккаунта?</p>
        <Link href="/start-registration" className="text-[#3F28C6] underline">
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
};

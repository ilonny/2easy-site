"use client";
import { fetchPostJson } from "@/api";
import { AuthContext } from "@/auth";
import { writeToLocalStorage } from "@/auth/utils";
import { Button } from "@/ui";
import { Checkbox, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type TLoginInputs = {
  name: string;
  login: string;
  privacy: string;
};

type TConfirmInputs = {
  password: string;
};

export const RegistrationForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<TLoginInputs>();

  const {
    control: confirmControl,
    handleSubmit: confirmSubmit,
    formState: { errors: confirmErrors },
  } = useForm<TConfirmInputs>();

  const [responseError, setResponseError] = useState("");
  const [step, setStep] = useState(0);
  const { setProfile } = useContext(AuthContext);
  const router = useRouter();

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    mutation.mutate(data);
  };

  const onSubmitConfirm: SubmitHandler<TConfirmInputs> = (data) => {
    loginMutation.mutate({ ...data, login: getValues().login });
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      return fetchPostJson({
        path: "/register",
        data,
      });
    },
    onMutate: () => setResponseError(""),
    onSettled: (data) => {
      data?.json().then((res) => {
        if (res.message) {
          setResponseError(res.message);
        }
        if (res.ok) {
          setStep(1);
          return;
        }
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data) => {
      return fetchPostJson({
        path: "/login",
        data,
      });
    },
    onMutate: () => setResponseError(""),
    onSettled: (data) => {
      data?.json().then((res) => {
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

  if (step === 1) {
    return (
      <form key={2} onSubmit={confirmSubmit(onSubmitConfirm)}>
        <div className="relative mb-16">
          <h3 className="text-center font-extrabold text-2xl mb-2">
            Регистрация
          </h3>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-[#787878] absolute left-0 top-1"
          >
            {"<-"} Назад
          </button>
        </div>
        <p className="text-center mb-7 font-medium">
          Введите пароль, отправленный на почту {getValues()?.login}
        </p>
        <Controller
          name="password"
          control={confirmControl}
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
              errorMessage={confirmErrors?.password?.message}
              isInvalid={!!confirmErrors.password?.message}
            />
          )}
        />
        <div className="mb-10">
          <Button
            isLoading={loginMutation.isPending}
            type="submit"
            text="Войти"
            fullWidth
            mediumHeight
          />
          {!!responseError && (
            <p className="text-tiny text-danger mt-2">{responseError}</p>
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
  }

  return (
    <form key={1} onSubmit={handleSubmit(onSubmit)}>
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
      <Controller
        name="privacy"
        control={control}
        rules={{
          required: "Обязательное поле",
        }}
        render={({ field }) => (
          <Checkbox
            {...field}
            radius="sm"
            className="mb-5"
            errorMessage={errors?.privacy?.message}
            isInvalid={!!errors.privacy?.message}
          >
            <p className="text-small">
              Я принимаю условия{" "}
              <a className="text-primary" href="/public_offer" target="_blank">
                публичной оферты
              </a>{" "}
              и{" "}
              <a
                className="text-primary"
                href="/privacy_policy"
                target="_blank"
              >
                политики конфиденциальности
              </a>{" "}
              и даю свое согласие на обработку персональных данных
            </p>
          </Checkbox>
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
          <p className="text-tiny text-danger mt-2">{responseError}</p>
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

import { Button } from "@/ui";
import { Input } from "@nextui-org/react";

import Link from "next/link";
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

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    console.log(data);
  };

  console.log("errors", errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-center font-extrabold text-2xl mb-5">Вход</h3>
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
        rules={{ required: "Пароль обязательное поле" }}
        render={({ field }) => (
          <Input
            {...field}
            label="Пароль"
            className="mb-5"
            radius="sm"
            errorMessage={errors?.password?.message}
            isInvalid={!!errors.password?.message}
          />
        )}
      />
      <div className="mb-10">
        <Button type="submit" text="Войти" fullWidth mediumHeight />
      </div>
      <div className="flex justify-center items-center gap-2">
        <p>Нет аккаунта?</p>
        <Link href="/" className="text-[#3F28C6] underline">
          Зарегистрироваться
        </Link>
      </div>
    </form>
  );
};

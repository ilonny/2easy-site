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
        setErrorText("Пароли должны совпадать");
        return;
      }
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <>
      <h3 className="text-center font-extrabold text-2xl mb-2">
        Изменить пароль
      </h3>
      <p className="text-center mb-7 font-medium"></p>
      <form key={1} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="old_password"
          control={control}
          rules={{ required: "Введите старый пароль" }}
          render={({ field }) => (
            <Input
              {...field}
              label="Старый пароль"
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
          rules={{ required: "Введите новый пароль" }}
          render={({ field }) => (
            <Input
              {...field}
              label="Новый пароль"
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
          rules={{ required: "Повторите новый пароль" }}
          render={({ field }) => (
            <Input
              {...field}
              label="Новый пароль"
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
            Подтвердить
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

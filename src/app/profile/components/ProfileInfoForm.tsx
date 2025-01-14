import { useCallback, useContext } from "react";
import { ProfileImagePicker } from "./ProfileImagePicker";
import { AuthContext } from "@/auth";
import { Controller, useForm } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";

type TFieldList = {
  name: string;
  login: string;
  phone: string;
  promocode: string;
  password: string;
};

export const ProfileInfoForm = () => {
  const { profile, authIsLoading } = useContext(AuthContext);

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

  const onSubmit = useCallback((_data) => {
    console.log("onSubmit", _data);
  }, []);

  return (
    <div className="flex gap-16 mb-20">
      <ProfileImagePicker />
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-[450px]">
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
        <div className="flex gap-2 items-baseline">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                isDisabled
                label="Пароль"
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
          <Button size="lg" type="button" className="text-small bg-black text-white">Изменить</Button>
        </div>
      </form>
    </div>
  );
};

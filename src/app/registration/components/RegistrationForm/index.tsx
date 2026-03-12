"use client";
import { useTranslation } from "react-i18next";
import { fetchPostJson } from "@/api";
import {
  EyeFilledIcon,
  EyeSlashFilledIcon,
} from "@/app/login/components/EyeIcon";
import { AuthContext } from "@/auth";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import { Button } from "@/ui";
import { Checkbox, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import ReactInputMask from "react-input-mask";

type TLoginInputs = {
  name: string;
  login: string;
  privacy: string;
  phone: string;
  ads_agreement: string;
};

type TConfirmInputs = {
  password: string;
};

export const RegistrationForm = () => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<TLoginInputs>({
    defaultValues: {
      name: "",
      login: "",
      privacy: false,
      phone: "",
      ads_agreement: true,
    },
  });

  const {
    control: confirmControl,
    handleSubmit: confirmSubmit,
    formState: { errors: confirmErrors },
  } = useForm<TConfirmInputs>();

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

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
          writeToLocalStorage("success_registration_completed", "1");
          setProfile(res);
          window?.ym(103955671, "reachGoal", "register-success");
          router.replace("/");
        }
      });
    },
  });

  const [canRegister, setCanRegister] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const alreadyRegistered = readFromLocalStorage(
        "success_registration_completed",
      );
      setCanRegister(!alreadyRegistered);
    }, 500);
  }, []);

  if (!canRegister) {
    return (
      <div>
        <div className="relative mb-16">
          <h3 className="text-center font-extrabold text-2xl mb-2">
            {t("auth.alreadyHaveAccount")}
          </h3>
        </div>
        <p className="text-center mb-7 font-medium">
          {t("auth.registrationLimited")}
        </p>
        <div className="mb-10">
          <div className="flex justify-center items-center gap-2 font-medium text-small">
            <Link href="/login" className="text-[#3F28C6] underline">
              {t("common.login")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <form key={2} onSubmit={confirmSubmit(onSubmitConfirm)}>
        <div className="relative mb-16">
          <h3 className="text-center font-extrabold text-2xl mb-2">
            {t("auth.registration")}
          </h3>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-[#787878] absolute left-0 top-1"
          >
            {"<-"} {t("common.back")}
          </button>
        </div>
        <p className="text-center mb-7 font-medium">
          {t("auth.enterPasswordSent")} {getValues()?.login}
        </p>
        <Controller
          name="password"
          control={confirmControl}
          rules={{
            required: t("auth.passwordRequired"),
          }}
          render={({ field }) => (
            <Input
              {...field}
              label={t("auth.password")}
              type={isVisible ? "text" : "password"}
              className="mb-8"
              radius="sm"
              errorMessage={confirmErrors?.password?.message}
              isInvalid={!!confirmErrors.password?.message}
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-solid outline-transparent"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
          )}
        />
        <div className="mb-10">
          <Button
            isLoading={loginMutation.isPending}
            type="submit"
            text={t("common.login")}
            fullWidth
            mediumHeight
          />
          {!!responseError && (
            <p className="text-tiny text-danger mt-2">{responseError}</p>
          )}
        </div>
        <div className="flex justify-center items-center gap-2 font-medium text-small">
          <p>{t("auth.alreadyHaveSubscription")}</p>
          <Link href="/login" className="text-[#3F28C6] underline">
            {t("common.login")}
          </Link>
        </div>
      </form>
    );
  }

  return (
    <form key={1} onSubmit={handleSubmit(onSubmit)}>
      <h3 className="text-center font-extrabold text-2xl mb-2">{t("auth.registration")}</h3>
      <p className="text-center mb-7 font-medium">
        {t("auth.afterRegistration")}
      </p>
      <Controller
        name="login"
        control={control}
        rules={{
          required: t("auth.emailRequired"),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t("auth.invalidEmail"),
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            radius="sm"
            label={t("auth.emailLabel")}
            className="mb-5"
            errorMessage={errors?.login?.message}
            isInvalid={!!errors.login?.message}
          />
        )}
      />
      <Controller
        name="name"
        control={control}
        rules={{ required: t("auth.nameRequired") }}
        render={({ field }) => (
          <Input
            {...field}
            label={t("auth.nameLabel")}
            className="mb-5"
            radius="sm"
            errorMessage={errors?.name?.message}
            isInvalid={!!errors.name?.message}
          />
        )}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <ReactInputMask
            mask="+9 (999) 999-99-999999"
            alwaysShowMask={false}
            maskChar=" "
            value={getValues().phone}
            onChange={(e) => field.onChange(e.target.value)}
          >
            {(inputProps) => (
              <Input
                {...inputProps}
                // {...field}
                radius="sm"
                label={t("auth.phoneLabel")}
                className="mb-5"
                errorMessage={errors?.phone?.message}
                isInvalid={!!errors.phone?.message}
              />
            )}
          </ReactInputMask>
        )}
      />
      <Controller
        name="privacy"
        control={control}
        rules={{
          required: t("auth.requiredField"),
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
              {t("auth.acceptTerms")}{" "}
              <a className="text-primary" href="/public_offer" target="_blank">
                {t("auth.publicOffer")}
              </a>{" "}
              {t("auth.and")}{" "}
              <a
                className="text-primary"
                href="/privacy_policy"
                target="_blank"
              >
                {t("auth.privacyPolicy")}
              </a>{" "}
              {t("auth.and")}{" "}
              <a
                className="text-primary"
                href="/personal_agreement"
                target="_blank"
              >
                {t("auth.personalDataConsent")}
              </a>
            </p>
          </Checkbox>
        )}
      />
      <Controller
        name="ads_agreement"
        control={control}
        rules={{
          required: false,
        }}
        render={({ field }) => (
          <Checkbox
            {...field}
            radius="sm"
            className="mb-5"
            isSelected={!!field.value}
          >
            <p className="text-small">
              {t("auth.newsConsent")}
            </p>
          </Checkbox>
        )}
      />
      <div className="mb-10">
        <Button
          isLoading={mutation.isPending}
          type="submit"
          text={t("auth.getPassword")}
          fullWidth
          mediumHeight
        />
        {!!responseError && (
          <p className="text-tiny text-danger mt-2">{responseError}</p>
        )}
      </div>
      <div className="flex justify-center items-center gap-2 font-medium text-small">
        <p>{t("auth.alreadyHaveSubscription")}</p>
        <Link href="/login" className="text-[#3F28C6] underline">
          {t("common.login")}
        </Link>
      </div>
    </form>
  );
};

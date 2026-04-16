"use client";
import { fetchPostJson } from "@/api";
import { AuthContext } from "@/auth";
import { writeToLocalStorage } from "@/auth/utils";

import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { EyeFilledIcon, EyeSlashFilledIcon } from "../EyeIcon";
import { toast } from "react-toastify";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TLoginInputs = {
  login: string;
  password: string;
};

type TStudentForgotInputs = {
  email: string;
};

type TTabKey = "teacher" | "student";

export const LoginForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginInputs>();

  const {
    control: forgotControl,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<TStudentForgotInputs>();

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const [responseError, setResponseError] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [tabKey, setTabKey] = useState<TTabKey>("teacher");
  const [studentForgotView, setStudentForgotView] = useState(false);
  const { setProfile } = useContext(AuthContext);
  const router = useRouter();

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    mutation.mutate({ ...data, role: tabKey });
  };

  const mutation = useMutation({
    mutationFn: (data: TLoginInputs & { role: TTabKey }) => {
      const { role, ...fields } = data;
      return fetchPostJson({
        path: "/login",
        data: { ...fields, role },
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
          if (res?.studentId) {
            router.replace(`/student-account/${res.studentId}`);
          } else {
            router.replace("/");
          }
        }
      });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: (payload: { email: string }) =>
      fetchPostJson({
        path: "/student-forgot-password",
        data: payload,
      }),
    onMutate: () => setForgotError(""),
    onSettled: async (response) => {
      if (!response) return;
      const res = await response.json();
      if (response.ok && res.success) {
        toast(i18n.t("auth.studentPasswordSent"), { type: "success" });
        resetForgotForm();
        setStudentForgotView(false);
        return;
      }
      if (res.code === "STUDENT_NOT_REGISTERED") {
        setForgotError(i18n.t("auth.studentNotRegistered"));
        return;
      }
      if (res.message) {
        setForgotError(res.message);
      }
    },
  });

  const onForgotSubmit: SubmitHandler<TStudentForgotInputs> = (data) => {
    forgotMutation.mutate({ email: data.email.trim() });
  };

  const switchTab = (key: TTabKey) => {
    setTabKey(key);
    setResponseError("");
    setForgotError("");
    setStudentForgotView(false);
    resetForgotForm();
  };

  const openStudentForgot = () => {
    setForgotError("");
    resetForgotForm();
    setStudentForgotView(true);
  };

  const backToStudentLogin = () => {
    setStudentForgotView(false);
    setForgotError("");
    resetForgotForm();
  };

  return (
    <div>
      <h3 className="text-center font-bold text-2xl mb-4">
        <T k="auth.loginTitle" />
      </h3>
      <div className="flex justify-center gap-6 sm:gap-10 mb-8 border-b border-default-200">
        <button
          type="button"
          className={`pb-3 px-1 text-sm sm:text-base font-medium transition-colors border-b-2 -mb-px ${
            tabKey === "teacher"
              ? "border-primary text-primary"
              : "border-transparent text-default-500 hover:text-default-700"
          }`}
          onClick={() => switchTab("teacher")}
        >
          <T k="auth.loginAsTeacher" />
        </button>
        <button
          type="button"
          className={`pb-3 px-1 text-sm sm:text-base font-medium transition-colors border-b-2 -mb-px ${
            tabKey === "student"
              ? "border-primary text-primary"
              : "border-transparent text-default-500 hover:text-default-700"
          }`}
          onClick={() => switchTab("student")}
        >
          <T k="auth.loginAsStudent" />
        </button>
      </div>

      {tabKey === "teacher" && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="login"
            control={control}
            rules={{ required: i18n.t("auth.emailRequired") }}
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
          <Controller
            name="password"
            control={control}
            rules={{
              required: i18n.t("auth.passwordRequired"),
            }}
            render={({ field }) => (
              <Input
                {...field}
                label={<T k="auth.password" />}
                type={isVisible ? "text" : "password"}
                className="mb-8"
                radius="sm"
                errorMessage={errors?.password?.message}
                isInvalid={!!errors.password?.message}
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
          <div className="flex items-center justify-end mb-16 min-h-[24px]">
            <Link
              href="/restore-password"
              className="text-[#3F28C6] underline text-sm"
            >
              <T k="auth.forgotPassword" />
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
              <T k="common.login" />
            </Button>
            {!!responseError && (
              <p className="text-tiny text-danger mt-2">{responseError}</p>
            )}
          </div>
          <div className="flex justify-center items-center gap-2 font-medium text-small">
            <p><T k="auth.noAccount" /></p>
            <Link href="/registration" className="text-[#3F28C6] underline">
              <T k="header.register" />
            </Link>
          </div>
        </form>
      )}

      {tabKey === "student" && studentForgotView && (
        <form onSubmit={handleForgotSubmit(onForgotSubmit)}>
          <p className="text-center text-small text-default-600 mb-6">
            <T k="auth.studentForgotHint" />
          </p>
          <Controller
            name="email"
            control={forgotControl}
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
                className="mb-6"
                errorMessage={forgotErrors?.email?.message}
                isInvalid={!!forgotErrors.email?.message}
              />
            )}
          />
          {!!forgotError && (
            <p className="text-tiny text-danger mb-4">{forgotError}</p>
          )}
          <div className="mb-6">
            <Button
              isLoading={forgotMutation.isPending}
              type="submit"
              fullWidth
              color="primary"
              size="lg"
              radius="sm"
            >
              <T k="auth.restorePasswordSubmit" />
            </Button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="text-[#3F28C6] underline text-sm font-medium"
              onClick={backToStudentLogin}
            >
              <T k="auth.backToLogin" />
            </button>
          </div>
        </form>
      )}

      {tabKey === "student" && !studentForgotView && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="login"
            control={control}
            rules={{ required: i18n.t("auth.emailRequired") }}
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
          <Controller
            name="password"
            control={control}
            rules={{
              required: i18n.t("auth.passwordRequired"),
            }}
            render={({ field }) => (
              <Input
                {...field}
                label={<T k="auth.password" />}
                type={isVisible ? "text" : "password"}
                className="mb-8"
                radius="sm"
                errorMessage={errors?.password?.message}
                isInvalid={!!errors.password?.message}
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
          <div className="flex items-center justify-end mb-16 min-h-[24px]">
            <button
              type="button"
              className="text-[#3F28C6] underline text-sm"
              onClick={openStudentForgot}
            >
              <T k="auth.forgotPassword" />
            </button>
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
              <T k="common.login" />
            </Button>
            {!!responseError && (
              <p className="text-tiny text-danger mt-2">{responseError}</p>
            )}
          </div>
          <p className="text-center text-small text-default-600 font-medium">
            <T k="auth.studentLoginHint" />
          </p>
        </form>
      )}
    </div>
  );
};

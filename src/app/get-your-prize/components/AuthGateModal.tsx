"use client";

import { fetchPostJson } from "@/api";
import { RegistrationForm } from "@/app/registration/components/RegistrationForm";
import { AuthContext } from "@/auth";
import { writeToLocalStorage } from "@/auth/utils";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type TProps = {
  open: boolean;
  onClose: () => void;
  onAuthed: () => void;
};

type TLogin = { login: string; password: string };

export const AuthGateModal = ({ open, onClose, onAuthed }: TProps) => {
  const { setProfile } = useContext(AuthContext);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const { control, handleSubmit } = useForm<TLogin>({
    defaultValues: { login: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (data: TLogin) =>
      fetchPostJson({
        path: "/login",
        data: { ...data, role: "teacher" },
      }),
    onMutate: () => setError(""),
    onSettled: async (res) => {
      if (!res) return;
      const data = await res.json();
      if (data?.message) {
        setError(data.message);
        return;
      }
      if (data?.token) {
        writeToLocalStorage("token", data.token);
        writeToLocalStorage("profile", JSON.stringify(data));
        setProfile?.(data);
        onAuthed();
      }
    },
  });

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="lg"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
        base: "mx-3 max-h-[min(92dvh,880px)] w-full max-w-[520px] sm:mx-auto",
        body: "max-h-[min(70dvh,640px)] overflow-y-auto overscroll-contain",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <span className="text-xl font-bold tracking-brand">
            <T k="getYourPrize.authTitle" />
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-[10px] px-3 py-1.5 text-sm font-bold ${
                tab === "login"
                  ? "bg-brand-violet text-white"
                  : "bg-brand-gray text-brand-black"
              }`}
              onClick={() => setTab("login")}
            >
              <T k="getYourPrize.loginTab" />
            </button>
            <button
              type="button"
              className={`rounded-[10px] px-3 py-1.5 text-sm font-bold ${
                tab === "register"
                  ? "bg-brand-violet text-white"
                  : "bg-brand-gray text-brand-black"
              }`}
              onClick={() => setTab("register")}
            >
              <T k="getYourPrize.registerTab" />
            </button>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          {tab === "login" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
            >
              <Controller
                name="login"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={i18n.t("auth.email")}
                    type="email"
                    autoComplete="username"
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label={i18n.t("auth.password")}
                    type="password"
                    autoComplete="current-password"
                  />
                )}
              />
              {error ? (
                <p className="text-sm font-medium text-danger">{error}</p>
              ) : null}
              <Button
                type="submit"
                className="h-[48px] rounded-[14px] bg-brand-violet font-bold text-white"
                isLoading={loginMutation.isPending}
              >
                <T k="getYourPrize.loginCta" />
              </Button>
            </form>
          ) : (
            <RegistrationForm
              onSuccess={() => {
                onAuthed();
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

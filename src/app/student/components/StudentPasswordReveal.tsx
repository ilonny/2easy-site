"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { checkResponse, fetchGet } from "@/api";
import { toast } from "react-toastify";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

const AUTO_HIDE_MS = 10_000;

type TProps = {
  studentId: number;
};

export const StudentPasswordReveal = ({ studentId }: TProps) => {
  const [password, setPassword] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const revealPassword = useCallback(() => {
    clearHideTimer();
    setRevealed(true);
    hideTimerRef.current = setTimeout(() => {
      setRevealed(false);
      hideTimerRef.current = null;
    }, AUTO_HIDE_MS);
  }, [clearHideTimer]);

  const hidePassword = useCallback(() => {
    clearHideTimer();
    setRevealed(false);
  }, [clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const loadPassword = useCallback(async () => {
    if (password) {
      revealPassword();
      return;
    }
    setLoading(true);
    try {
      const res = await fetchGet({
        path: `/student/${studentId}/password`,
        isSecure: true,
      });
      const json = await res.json();
      checkResponse(json);
      if (!json?.password) {
        toast.error(i18n.t("students.passwordNotFound"));
        return;
      }
      setPassword(json.password);
      revealPassword();
    } catch {
      toast.error(i18n.t("commonErrors.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, [password, revealPassword, studentId]);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.success(i18n.t("students.passwordCopied"));
    } catch {
      toast.error(i18n.t("commonErrors.somethingWentWrong"));
    }
  }, [password]);

  if (!password) {
    return (
      <ResponsiveTooltip content={i18n.t("students.showPasswordHint")}>
        <Button
          size="sm"
          variant="light"
          color="primary"
          className="h-7 min-w-0 px-2 text-xs font-medium"
          isLoading={loading}
          onClick={(e) => {
            e.stopPropagation();
            void loadPassword();
          }}
        >
          <T k="students.showPassword" />
        </Button>
      </ResponsiveTooltip>
    );
  }

  return (
    <div
      className="mt-2 flex items-center gap-2 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      <code className="rounded-md bg-default-100 px-2 py-1 text-sm tracking-wide">
        {revealed ? password : "••••••••••"}
      </code>
      <Button
        size="sm"
        variant="flat"
        className="h-7 min-w-0 px-2 text-xs"
        onClick={() => (revealed ? hidePassword() : revealPassword())}
      >
        {revealed ? <T k="students.hidePassword" /> : <T k="students.showPassword" />}
      </Button>
      <ResponsiveTooltip content={i18n.t("students.copyPassword")}>
        <Button
          size="sm"
          isIconOnly
          variant="flat"
          className="h-7 w-7 min-w-0"
          aria-label={i18n.t("students.copyPassword")}
          onClick={() => void copyPassword()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Button>
      </ResponsiveTooltip>
    </div>
  );
};

"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HeaderMenuList } from "../HeaderMenuList";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { TrialChip } from "../TrialChip";
import { useOpenCreateLesson } from "../HeaderProfile";
import { T } from "@/i18n/T";
import { TUserAccess } from "@/app/subscription/helpers";

type TProps = {
  isOpened: boolean;
  onClose?: () => void;
  access?: TUserAccess;
};

const primaryButtonClassName =
  "relative flex w-full items-center justify-center rounded-[14px] bg-brand-violet py-3.5 text-sm font-bold leading-[1.3] tracking-brand text-white transition-opacity hover:opacity-90";

export const SideBar: FC<TProps> = ({ isOpened, onClose, access }) => {
  const [mounted, setMounted] = useState(false);
  const openCreateLesson = useOpenCreateLesson();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpened || !mounted) {
    return null;
  }

  // Starts below the fixed header so the header stays visible.
  return createPortal(
    <div
      className="site-menu-layer fixed inset-x-0 bottom-0 top-[var(--site-header-h)] flex flex-col overflow-y-auto bg-white lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full flex-col items-center justify-between gap-10 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-20">
        <div className="flex flex-1 items-center">
          <HeaderMenuList variant="sidebar" onNavigate={onClose} />
        </div>
        <div className="flex w-full flex-col items-center gap-[15px] md:max-w-[400px]">
          <LanguageSwitcher variant="brandMenu" />
          {access === "guest" && (
            <div className="flex w-full flex-col gap-2.5">
              <Link
                href="/registration"
                onClick={onClose}
                className={primaryButtonClassName}
              >
                <T k="header.tryFree" />
                <TrialChip className="absolute right-2.5 top-[-14px]" />
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-[14px] bg-brand-gray py-3.5 text-sm font-bold leading-[1.3] tracking-brand text-brand-black transition-colors hover:bg-[#e6e6ea]"
              >
                <T k="header.login" />
              </Link>
              <Link
                href="/login?role=student"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-[14px] py-3.5 text-sm font-bold leading-[1.3] tracking-brand text-brand-violet transition-colors hover:bg-brand-gray"
              >
                <T k="header.imStudent" />
              </Link>
            </div>
          )}
          {access === "noSubscription" && (
            <Link
              href="/subscription"
              onClick={onClose}
              className={primaryButtonClassName}
            >
              <T k="header.chooseTariff" />
            </Link>
          )}
          {access === "subscribed" && (
            <button
              type="button"
              className={primaryButtonClassName}
              onClick={() => {
                onClose?.();
                openCreateLesson();
              }}
            >
              <T k="lessons.createLesson" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HeaderMenuList } from "../HeaderMenuList";
import i18n from "@/i18n/config";

type TProps = {
  isOpened: boolean;
  onClose?: () => void;
};

export const SideBar: FC<TProps> = ({ isOpened, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpened || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="site-menu-layer fixed inset-0 flex flex-col bg-white lg:hidden"
      style={{ height: "100dvh" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex shrink-0 items-center justify-end px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#EEEBFF] text-[#3F28C6]"
          aria-label={i18n.t("common.close")}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <HeaderMenuList variant="sidebar" onNavigate={onClose} />
      </div>
    </div>,
    document.body,
  );
};

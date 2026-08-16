"use client";

import { FC } from "react";
import { HeaderMenuList } from "../HeaderMenuList";

type TProps = {
  isOpened: boolean;
  onClose?: () => void;
};

export const SideBar: FC<TProps> = ({ isOpened, onClose }) => {
  if (!isOpened) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[50] flex flex-col bg-white"
      style={{ height: "100dvh" }}
      role="dialog"
      aria-modal="true"
    >
      {/* Offset under fixed header so burger stays usable; content fills the rest */}
      <div className="h-[80px] shrink-0 lg:h-0" />
      <div className="flex min-h-0 flex-1 flex-col">
        <HeaderMenuList variant="sidebar" onNavigate={onClose} />
      </div>
    </div>
  );
};

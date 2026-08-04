"use client";

import { CloseIcon } from "@nextui-org/shared-icons";
import { ButtonHTMLAttributes, forwardRef } from "react";

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "modal" | "header";
};

const baseClassName =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center appearance-none select-none p-0 text-foreground-500 rounded-full outline-none hover:bg-default-100 active:bg-default-200 tap-highlight-transparent touch-manipulation";

export const BoardCloseButton = forwardRef<HTMLButtonElement, TProps>(
  ({ variant = "modal", className = "", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={[
        baseClassName,
        variant === "header" ? "absolute top-2 right-2 z-20" : "z-20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Close"
      {...props}
    >
      <CloseIcon className="h-5 w-5" />
    </button>
  ),
);

BoardCloseButton.displayName = "BoardCloseButton";

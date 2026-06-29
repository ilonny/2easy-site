"use client";

import { CloseIcon } from "@nextui-org/shared-icons";
import { ButtonHTMLAttributes, forwardRef } from "react";

type TProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "modal" | "header";
};

const baseClassName =
  "inline-flex appearance-none select-none p-2 text-foreground-500 rounded-full outline-none hover:bg-default-100 active:bg-default-200 tap-highlight-transparent";

export const BoardCloseButton = forwardRef<HTMLButtonElement, TProps>(
  ({ variant = "modal", className = "", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={[
        baseClassName,
        variant === "header" ? "absolute top-1 right-1 z-20" : "z-20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Close"
      {...props}
    >
      <CloseIcon />
    </button>
  ),
);

BoardCloseButton.displayName = "BoardCloseButton";

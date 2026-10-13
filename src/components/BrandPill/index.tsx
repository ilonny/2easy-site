import { ButtonHTMLAttributes, ReactNode } from "react";

type TProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const brandPillActiveClassName =
  "bg-brand-violet text-white hover:opacity-90";

export const brandPillIdleClassName =
  "bg-brand-gray text-brand-black hover:bg-[#e6e6ea]";

/** ~20% smaller below 1200px vs desktop size. */
export const brandPillBaseClassName =
  "inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[11px] px-2.5 text-[11px] font-bold leading-none tracking-brand transition-colors min-[1200px]:h-10 min-[1200px]:rounded-[14px] min-[1200px]:px-4 min-[1200px]:text-sm";

export const BrandPill = ({
  active = false,
  children,
  className = "",
  type = "button",
  ...rest
}: TProps) => {
  return (
    <button
      type={type}
      className={`${brandPillBaseClassName} ${
        active ? brandPillActiveClassName : brandPillIdleClassName
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

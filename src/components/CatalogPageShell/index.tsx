import { ReactNode } from "react";
import { landingContainerClassName } from "@/constants/layout";

type TProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Lock page to viewport height; only nested panes scroll (e.g. calendar). */
  fillHeight?: boolean;
};

export const CatalogPageShell = ({
  title,
  subtitle,
  children,
  className = "",
  fillHeight = false,
}: TProps) => {
  return (
    <main
      className={`bg-white ${
        fillHeight
          ? "flex h-[calc(100dvh-var(--site-header-h,0px)-var(--app-install-banner-h,0px))] flex-col overflow-hidden"
          : ""
      } ${className}`}
    >
      <div
        className={`${landingContainerClassName} flex flex-col ${
          fillHeight
            ? "min-h-0 flex-1 gap-4 overflow-hidden pb-4 pt-6 lg:gap-5 lg:pb-5 lg:pt-8"
            : "gap-[30px] pb-16 pt-8 lg:gap-[50px] lg:pb-24 lg:pt-12"
        }`}
      >
        <div className="mx-auto flex max-w-[675px] shrink-0 flex-col items-center gap-2 px-1 lg:gap-3">
          <h1
            className={`text-center font-bold leading-none text-brand-black ${
              fillHeight
                ? "text-[22px] lg:text-[32px]"
                : "text-[25px] lg:text-[40px]"
            }`}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="text-center text-sm leading-[1.3] text-brand-grayFont lg:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {fillHeight ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:gap-5">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </main>
  );
};

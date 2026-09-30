import { ReactNode } from "react";
import { T } from "@/i18n/T";

type TProps = {
  icon: ReactNode;
  labelKey: string;
  titleKey: string;
  className?: string;
};

export const SectionHeading = ({
  icon,
  labelKey,
  titleKey,
  className = "",
}: TProps) => {
  return (
    <div className={`mx-auto flex max-w-[460px] flex-col items-center lg:max-w-[550px] ${className}`}>
      <span className="flex items-center justify-center gap-1.5 lg:px-2.5 lg:py-2">
        <span className="relative size-4 shrink-0" aria-hidden>
          {icon}
        </span>
        <T
          k={labelKey}
          className="whitespace-nowrap text-xs font-bold tracking-brand text-brand-black lg:text-sm"
        />
      </span>
      <h2 className="text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:text-[40px]">
        <T k={titleKey} />
      </h2>
    </div>
  );
};

import { ReactNode } from "react";

export type TTagTone = "violet" | "green" | "mint" | "blue" | "white";

type TProps = {
  tone?: TTagTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const toneClassNames: Record<TTagTone, string> = {
  violet: "bg-[#F0EDFD] text-[#7561DB]",
  green: "bg-[#E9FFCA] text-[#5F8E1C]",
  mint: "bg-[#D0F2E5] text-[#229167]",
  blue: "bg-[#DFEDFF] text-[#1E79EE]",
  white: "bg-white text-[#7561DB]",
};

export const Tag = ({ tone = "violet", icon, children, className = "" }: TProps) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-2xl py-[5px] text-[10px] font-bold leading-[14px] tracking-brand lg:text-xs lg:leading-4 ${
        tone === "white" ? "px-1.5" : "px-2"
      } ${toneClassNames[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};

/** Three ascending bars used in the level tags. */
export const LevelIcon = () => (
  <span className="relative size-[15px] shrink-0" aria-hidden>
    <span className="absolute left-[1.16px] top-[7.07px] h-[4.44px] w-[3.81px] rounded-[1.5px] bg-current" />
    <span className="absolute left-[5.6px] top-[5.16px] h-[6.35px] w-[3.81px] rounded-[1.5px] bg-current" />
    <span className="absolute left-[10.04px] top-[3.26px] h-[8.25px] w-[3.81px] rounded-[1.5px] bg-current" />
  </span>
);

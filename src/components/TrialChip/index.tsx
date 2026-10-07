import Image from "next/image";
import { T } from "@/i18n/T";
import FireChipIcon from "@/assets/icons/fire_chip.svg";
import FireChipLgIcon from "@/assets/icons/fire_chip_lg.svg";

type TProps = {
  className?: string;
  /** Grows to the desktop size from the `lg` breakpoint. */
  responsive?: boolean;
};

export const TrialChip = ({ className = "", responsive }: TProps) => {
  return (
    <span
      className={`pointer-events-none flex rotate-[5.88deg] items-center gap-1 whitespace-nowrap rounded-[14px] bg-brand-green py-[3px] pl-1.5 pr-[3px] text-[10px] font-bold leading-none tracking-brand text-brand-black ${
        responsive ? "lg:py-1 lg:pl-2 lg:pr-1 lg:text-xs lg:leading-none" : ""
      } ${className}`}
    >
      <T k="header.sevenDays" />
      <Image
        src={FireChipIcon}
        alt=""
        aria-hidden
        className={responsive ? "lg:hidden" : ""}
      />
      {responsive && (
        <Image
          src={FireChipLgIcon}
          alt=""
          aria-hidden
          className="hidden lg:block"
        />
      )}
    </span>
  );
};

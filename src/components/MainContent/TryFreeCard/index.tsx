import Image from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { Tag } from "@/components/Tag";
import TryFreeBg from "@/assets/images/content/try_free.jpg";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import TagLabelIcon from "@/assets/icons/tag_label.svg";
import ClockIcon from "@/assets/icons/clock_violet.svg";
import SavedIcon from "@/assets/icons/saved_violet.svg";

type TProps = {
  href: string;
  buttonKey: string;
};

export const TryFreeCard = ({ href, buttonKey }: TProps) => {
  return (
    <div className="relative flex w-[260px] shrink-0 snap-start flex-col justify-end gap-[15px] self-stretch overflow-hidden rounded-[20px] p-[15px] pt-[98px] md:w-auto md:pt-[185px] lg:gap-6 lg:rounded-[30px] lg:p-6 lg:pt-[251px]">
      <Image
        src={TryFreeBg}
        alt=""
        fill
        sizes="(min-width: 1024px) 315px, 260px"
        className="pointer-events-none object-cover object-top"
      />
      <T
        k="content.tryTitle"
        as="p"
        className="relative text-sm font-bold leading-[1.3] tracking-brand text-brand-black lg:text-base lg:leading-[22px] lg:tracking-normal"
      />
      <span className="relative flex flex-wrap gap-1.5">
        <Tag
          tone="white"
          icon={
            <span className="relative size-[13px] shrink-0">
              <Image
                src={TagLabelIcon}
                alt=""
                aria-hidden
                className="absolute left-[1px] top-[1.5px] -scale-x-100"
              />
            </span>
          }
        >
          <T k="content.tagFree" />
        </Tag>
        <Tag tone="white" icon={<Image src={ClockIcon} alt="" aria-hidden />}>
          <T k="content.tagDays" />
        </Tag>
        <Tag tone="white" icon={<Image src={SavedIcon} alt="" aria-hidden />}>
          <T k="content.tagNoCard" />
        </Tag>
      </span>
      <Link
        href={href}
        className="relative flex items-center justify-between rounded-[14px] bg-brand-violet py-[7px] pl-3.5 pr-[7px] text-xs font-bold leading-none tracking-brand text-white transition-opacity hover:opacity-90 lg:pl-6 lg:text-sm lg:leading-none"
      >
        <T k={buttonKey} />
        <Image src={FireButtonIcon} alt="" aria-hidden className="size-8" />
      </Link>
    </div>
  );
};

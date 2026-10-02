import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { Tag } from "@/components/Tag";
import TryFreeSpeaking from "@/assets/images/content/try_free.jpg";
import TryFreeLessons from "@/assets/images/content/try_free_lessons.jpg";
import TryFreeCourses from "@/assets/images/content/try_free_courses.jpg";
import TryFreeDiscussion from "@/assets/images/content/try_free_discussion.jpg";
import TryFreeGrammar from "@/assets/images/content/try_free_grammar.jpg";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import TagLabelIcon from "@/assets/icons/tag_label.svg";
import ClockIcon from "@/assets/icons/clock_violet.svg";
import SavedIcon from "@/assets/icons/saved_violet.svg";
import { TContentTab } from "../useTabCards";

type TVariant = {
  image: StaticImageData;
  titleKey: string;
  // Keeps the text clear of the pack drawn at the top of the image.
  paddingClassName: string;
};

const trialPadding = "pt-[90px] md:pt-[110px] lg:pt-[130px]";

const variants: Record<TContentTab, TVariant> = {
  speaking: {
    image: TryFreeSpeaking,
    titleKey: "content.tryTitle",
    paddingClassName: "pt-[98px] md:pt-[185px] lg:pt-[251px]",
  },
  lessons: {
    image: TryFreeLessons,
    titleKey: "content.tryTitleTrial",
    paddingClassName: trialPadding,
  },
  courses: {
    image: TryFreeCourses,
    titleKey: "content.tryTitleCourses",
    paddingClassName: trialPadding,
  },
  discussion: {
    image: TryFreeDiscussion,
    titleKey: "content.tryTitleTrial",
    paddingClassName: trialPadding,
  },
  grammar: {
    image: TryFreeGrammar,
    titleKey: "content.tryTitleTrial",
    paddingClassName: trialPadding,
  },
};

type TProps = {
  tab: TContentTab;
  href: string;
  buttonKey: string;
};

// Stretches to the height of the neighbouring cards: the picture stays pinned to the top,
// the text and the button to the bottom.
export const TryFreeCard = ({ tab, href, buttonKey }: TProps) => {
  const variant = variants[tab];
  return (
    <div
      className={`relative flex w-[260px] shrink-0 snap-start flex-col justify-end gap-[15px] self-stretch overflow-hidden rounded-[20px] bg-[#F1F1F3] p-[15px] md:w-auto lg:gap-6 lg:rounded-[30px] lg:p-6 ${variant.paddingClassName}`}
    >
      <Image
        src={variant.image}
        alt=""
        sizes="(min-width: 1024px) 315px, 260px"
        className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full"
      />
      <T
        k={variant.titleKey}
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

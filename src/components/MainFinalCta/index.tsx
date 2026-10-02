"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { T } from "@/i18n/T";
import { useUserAccess } from "@/app/subscription/helpers";
import { landingContainerClassName } from "@/constants/layout";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import ReadyLesson from "@/assets/images/final/ready_lesson.jpg";
import ReadyLessonTablet from "@/assets/images/final/ready_lesson_tablet.jpg";
import CreateLesson from "@/assets/images/final/create_lesson.jpg";

type TOption = {
  titleKey: string;
  textKey: string;
  buttonKey: string;
  href: string;
  image: StaticImageData;
  tabletImage?: StaticImageData;
};

const options: TOption[] = [
  {
    titleKey: "finalCta.readyTitle",
    textKey: "finalCta.readyText",
    buttonKey: "finalCta.readyButton",
    href: "/lesson_plans",
    image: ReadyLesson,
    tabletImage: ReadyLessonTablet,
  },
  {
    titleKey: "finalCta.createTitle",
    textKey: "finalCta.createText",
    buttonKey: "finalCta.createButton",
    href: "/lessons",
    image: CreateLesson,
  },
];

export const MainFinalCta = () => {
  const access = useUserAccess();

  if (access === "student") return null;

  return (
    <section
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <h2 className="mx-auto max-w-[460px] text-center text-[25px] font-bold leading-none tracking-brand text-brand-black lg:max-w-[550px] lg:text-[40px]">
        <T k="finalCta.title" />
      </h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 wide:grid-cols-[repeat(2,570px)] wide:justify-center">
        {options.map((option) => (
          <div
            key={option.titleKey}
            className="relative flex flex-col items-center overflow-hidden rounded-[20px] bg-brand-gray px-[25px] pb-[240px] pt-[25px] md:h-[420px] md:pb-0 lg:h-[534px] lg:rounded-[30px] lg:px-9 lg:pt-[60px] wide:h-[580px] wide:px-[58px]"
          >
            <Image
              src={option.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 570px, (min-width: 768px) 380px, 100vw"
              className={`object-cover object-bottom ${option.tabletImage ? "md:max-lg:hidden" : ""}`}
            />
            {option.tabletImage && (
              <Image
                src={option.tabletImage}
                alt=""
                fill
                sizes="380px"
                className="hidden object-cover object-bottom md:max-lg:block"
              />
            )}
            <div className="relative flex flex-col items-center gap-[18px] text-center font-bold tracking-brand text-brand-black md:gap-[15px] lg:gap-[30px]">
              <T
                k={option.titleKey}
                as="p"
                className="text-base leading-none md:leading-[1.2] lg:text-[22px] lg:leading-[1.2]"
              />
              <T
                k={option.textKey}
                as="p"
                className="text-sm leading-[1.3] lg:text-base lg:leading-[1.3]"
              />
              <Link
                href={access === "guest" ? "/registration" : option.href}
                className="flex items-center gap-[15px] whitespace-nowrap rounded-[14px] bg-brand-violet py-[7px] pl-3.5 pr-[7px] text-xs leading-none text-white transition-opacity hover:opacity-90 lg:gap-2.5 lg:pl-3 lg:text-sm"
              >
                <T k={option.buttonKey} />
                <Image
                  src={FireButtonIcon}
                  alt=""
                  aria-hidden
                  className="size-8"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

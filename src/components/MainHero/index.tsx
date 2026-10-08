"use client";
import Image from "next/image";
import { T } from "@/i18n/T";
import UserIcon from "@/assets/icons/user.svg";
import { HeroCta } from "./HeroCta";
import { HeroCards } from "./HeroCards";
import { HeroDecor } from "./HeroDecor";

export const MainHero = () => {
  return (
    <section className="relative overflow-hidden bg-white lg:mt-[var(--site-header-extra-h,0px)]">
      <HeroDecor />
      <div className="relative mx-auto flex max-w-[375px] flex-col items-center gap-5 px-5 pt-[60px] text-center md:max-w-[410px] lg:max-w-[630px] lg:px-0 lg:pt-[82px] min-[1200px]:pt-[108px]">
        <p className="flex items-center gap-[5.118px] px-[8.529px] py-[6.824px] text-xs font-bold leading-4 tracking-brand text-brand-black lg:gap-1.5 lg:px-2.5 lg:py-2 lg:text-sm lg:leading-[19px]">
          <span className="relative size-[13.647px] shrink-0 lg:size-4">
            <Image
              src={UserIcon}
              alt=""
              aria-hidden
              className="absolute left-[13.55%] top-0 h-[93.75%] w-[72.91%]"
            />
          </span>
          <T k="hero.badge" />
        </p>
        <div className="flex w-full flex-col items-center gap-5 lg:gap-[30px]">
          <h1 className="text-[30px] font-bold leading-none tracking-brand text-brand-black lg:text-[48px]">
            <T k="hero.title" />
          </h1>
          <p className="text-sm font-bold leading-[1.3] tracking-brand text-brand-black lg:max-w-[495px] lg:text-base lg:leading-[1.3]">
            <T k="hero.subtitle" />
          </p>
          <HeroCta />
        </div>
      </div>
      <div className="relative mt-[60px]">
        <HeroCards />
      </div>
    </section>
  );
};

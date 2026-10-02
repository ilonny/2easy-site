"use client";
import { useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import { LoopVideo } from "@/components/LoopVideo";
import { getRenderScale } from "@/hooks/useLandingZoom";
import EditIcon from "@/assets/icons/edit_violet.svg";
import Builder from "@/assets/images/prep/builder.jpg";
import ReadyLessons from "@/assets/images/prep/ready_lessons.jpg";
import Share from "@/assets/images/prep/share.jpg";
import Ai from "@/assets/images/prep/ai.jpg";

type TFeature = {
  titleKey: string;
  image: StaticImageData;
  video?: string;
};

const features: TFeature[] = [
  {
    titleKey: "prep.builder",
    image: Builder,
    video: "/video/landing/prep-builder.mp4",
  },
  { titleKey: "prep.readyLessons", image: ReadyLessons },
  { titleKey: "prep.share", image: Share },
  { titleKey: "prep.ai", image: Ai },
];

export const MainPrep = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // On desktop the heading stays pinned and fades out while the cards slide over it.
  useEffect(() => {
    const heading = headingRef.current;
    const cards = cardsRef.current;
    if (!heading || !cards) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches || reducedMotion.matches) {
        heading.style.opacity = "";
        heading.style.transform = "";
        return;
      }
      const headingRect = heading.getBoundingClientRect();
      const distance = cards.getBoundingClientRect().top - headingRect.top;
      const gap = 170 * getRenderScale(cards);
      const progress = Math.min(
        1,
        Math.max(0, distance / (headingRect.height + gap)),
      );
      heading.style.opacity = String(progress);
      heading.style.transform = `scale(${0.94 + 0.06 * progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section
      className={`${landingContainerClassName} flex flex-col items-center gap-[30px] lg:gap-[170px] lg:pt-[100px]`}
    >
      <div ref={headingRef} className="lg:sticky lg:top-[100px]">
        <SectionHeading
          icon={
            <Image
              src={EditIcon}
              alt=""
              className="absolute left-0.5 top-0.5"
            />
          }
          labelKey="prep.label"
          titleKey="prep.title"
          className="gap-5 lg:gap-[30px]"
        />
      </div>
      <div
        ref={cardsRef}
        className="relative z-10 grid w-full grid-cols-1 gap-2.5 md:grid-cols-[repeat(2,minmax(0,380px))] md:justify-center md:gap-[15px] lg:grid-cols-[570px] lg:gap-[30px]"
      >
        {features.map((feature) => (
          <div
            key={feature.titleKey}
            className="relative flex aspect-square flex-col items-center overflow-hidden rounded-[20px] bg-brand-gray px-[25px] pb-[15px] pt-[25px] lg:aspect-auto lg:h-[560px] lg:rounded-[30px] lg:px-[95px] lg:pb-10 lg:pt-[50px]"
          >
            <Image
              src={feature.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 570px, (min-width: 768px) 380px, 100vw"
              className="pointer-events-none object-cover"
            />
            {feature.video && (
              <LoopVideo
                src={feature.video}
                poster={feature.image.src}
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <T
              k={feature.titleKey}
              as="p"
              className="relative w-full text-center text-base font-bold leading-[1.2] tracking-brand text-brand-black lg:text-[22px] lg:leading-[1.2]"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

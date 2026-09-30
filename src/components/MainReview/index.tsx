"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import ScanIcon from "@/assets/icons/scan_violet.svg";
import Builder from "@/assets/images/review/builder.jpg";
import Autocheck from "@/assets/images/review/autocheck.jpg";
import Realtime from "@/assets/images/review/realtime.jpg";
import Feedback from "@/assets/images/review/feedback.jpg";

type TFeature = {
  titleKey: string;
  descKey?: string;
  image: StaticImageData;
  /** Screencast shown over the image once the designers hand it over. */
  video?: string;
};

const features: TFeature[] = [
  { titleKey: "review.builder", image: Builder },
  { titleKey: "review.autocheck", descKey: "review.autocheckDesc", image: Autocheck },
  { titleKey: "review.realtime", image: Realtime },
  { titleKey: "review.feedback", image: Feedback },
];

export const MainReview = () => {
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const center = window.innerHeight / 2;
      let closest = 0;
      let minDistance = Infinity;
      panelRefs.current.forEach((panel, index) => {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - center);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });
      setActive(closest);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToPanel = (index: number) => {
    panelRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      className={`${landingContainerClassName} flex flex-col gap-[30px] lg:gap-[50px]`}
    >
      <SectionHeading
        icon={<Image src={ScanIcon} alt="" className="absolute inset-0" />}
        labelKey="review.label"
        titleKey="review.title"
        className="gap-5"
      />
      <div className="lg:flex lg:justify-between">
        <div className="hidden lg:block">
          <div className="sticky top-[calc(50vh-285px)] flex h-[570px] flex-col items-start justify-center gap-[41px] pl-[90px]">
            {features.map((feature, index) => (
              <button
                key={feature.titleKey}
                type="button"
                onClick={() => scrollToPanel(index)}
                className={`flex w-[395px] flex-col gap-[15px] text-left font-bold tracking-brand transition-[padding,opacity] duration-300 ${
                  active === index ? "pl-10" : "pl-0 opacity-50 hover:opacity-75"
                }`}
              >
                <span className="relative block w-[355px] text-[22px] leading-[1.2] text-brand-black">
                  <span
                    className={`absolute -left-10 top-1/2 size-3 -translate-y-1/2 rounded-full bg-brand-orange transition-opacity duration-300 ${
                      active === index ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <T k={feature.titleKey} />
                </span>
                {feature.descKey && (
                  <T
                    k={feature.descKey}
                    className="block w-[355px] text-base leading-[1.3] text-brand-grayFont"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[repeat(2,minmax(0,380px))] md:justify-center md:gap-5 lg:w-[647px] lg:grid-cols-1">
          {features.map((feature, index) => (
            <div key={feature.titleKey} className="flex flex-col gap-5">
              <div
                ref={(el) => {
                  panelRefs.current[index] = el;
                }}
                className="relative aspect-[647/570] overflow-hidden rounded-[20px] bg-brand-gray lg:rounded-[30px]"
              >
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 647px, (min-width: 768px) 380px, 100vw"
                  className="object-cover"
                />
                {feature.video && (
                  <video
                    src={feature.video}
                    poster={feature.image.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2.5 px-[30px] text-center font-bold tracking-brand md:px-10 lg:hidden">
                <T
                  k={feature.titleKey}
                  as="p"
                  className="text-base leading-[1.2] text-brand-black"
                />
                {feature.descKey && (
                  <T
                    k={feature.descKey}
                    as="p"
                    className="text-sm leading-[1.3] text-brand-grayFont"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

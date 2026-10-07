"use client";

import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import { LoopVideo } from "@/components/LoopVideo";
import { getClientScale, getRenderScale } from "@/hooks/useLandingZoom";
import { getSiteHeaderHeight } from "@/constants/uiLayers";
import ScanIcon from "@/assets/icons/scan_violet.svg";
import Builder from "@/assets/images/review/builder.jpg";
import Autocheck from "@/assets/images/review/autocheck.jpg";
import Realtime from "@/assets/images/review/realtime.jpg";
import Feedback from "@/assets/images/review/feedback.jpg";

type TFeature = {
  titleKey: string;
  descKey?: string;
  image: StaticImageData;
  video?: string;
};

const features: TFeature[] = [
  {
    titleKey: "review.builder",
    image: Builder,
    video: "/video/landing/review-builder.mp4",
  },
  {
    titleKey: "review.autocheck",
    descKey: "review.autocheckDesc",
    image: Autocheck,
    video: "/video/landing/review-autocheck.mp4",
  },
  {
    titleKey: "review.realtime",
    image: Realtime,
    video: "/video/landing/review-realtime.mp4",
  },
  {
    titleKey: "review.feedback",
    image: Feedback,
    video: "/video/landing/review-feedback.mp4",
  },
];

const PANEL_HEIGHT = 570;

// Scroll distance of the pinned stage and its top offset in client-rect units
// (centred below the site header), plus the factor converting those units to screen pixels.
const measureTrack = (track: HTMLElement) => {
  const scale = getRenderScale(track);
  const clientScale = getClientScale(track);
  return {
    travel: (track.offsetHeight - PANEL_HEIGHT) * scale,
    stickyTop:
      (window.innerHeight / clientScale +
        (getSiteHeaderHeight() - PANEL_HEIGHT) * scale) /
      2,
    clientScale,
  };
};

const PanelMedia = ({
  feature,
  sizes,
  playing,
}: {
  feature: TFeature;
  sizes: string;
  playing?: boolean;
}) => (
  <>
    <Image
      src={feature.image}
      alt=""
      fill
      sizes={sizes}
      className="object-cover object-bottom"
    />
    {feature.video && (
      <LoopVideo
        src={feature.video}
        poster={feature.image.src}
        playing={playing}
        className="absolute inset-0 size-full object-cover object-bottom"
      />
    )}
  </>
);

export const MainReview = () => {
  const [active, setActive] = useState(0);
  const [markerY, setMarkerY] = useState<number | null>(null);
  const [markerMoves, setMarkerMoves] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Desktop: the stage pins in the middle of the screen and scroll progress picks the step.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { travel, stickyTop } = measureTrack(track);
      const progress = (stickyTop - track.getBoundingClientRect().top) / travel;
      const step = Math.floor(
        Math.min(1, Math.max(0, progress)) * features.length,
      );
      setActive(Math.min(features.length - 1, step));
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

  const positionMarker = useCallback(() => {
    const tab = tabRefs.current[active];
    const title = titleRefs.current[active];
    if (!tab || !title) return;
    setMarkerY(tab.offsetTop + title.offsetHeight / 2 - 6);
  }, [active]);

  useEffect(() => {
    positionMarker();
    setMarkerMoves((count) => count + 1);
    window.addEventListener("resize", positionMarker);
    return () => window.removeEventListener("resize", positionMarker);
  }, [positionMarker]);

  const goTo = (index: number, focus = false) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(features.length - 1, index));
    const { travel, stickyTop, clientScale } = measureTrack(track);
    const offset =
      track.getBoundingClientRect().top -
      stickyTop +
      (travel * (next + 0.5)) / features.length;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: window.scrollY + offset * clientScale,
      behavior: reducedMotion ? "auto" : "smooth",
    });
    if (focus) tabRefs.current[next]?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: features.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      goTo(keys[event.key], true);
    }
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

      <div
        ref={trackRef}
        className="relative hidden h-[calc(570px+240vh)] lg:block"
      >
        <div className="sticky top-[calc(50vh/var(--landing-zoom,1)+var(--site-header-h)/2-285px)] flex h-[570px] items-center justify-between gap-[30px]">
          <div className="min-w-0 max-w-[395px] flex-1 wide:max-w-[485px] wide:pl-[90px]">
            <div
              className="relative flex flex-col gap-[41px]"
              role="tablist"
              aria-orientation="vertical"
            >
              {markerY !== null && (
                <span
                  className="pointer-events-none absolute left-0 top-0 z-[1] size-3 transition-transform duration-[520ms] ease-out-expo motion-reduce:transition-none"
                  style={{ transform: `translateY(${markerY}px)` }}
                  aria-hidden
                >
                  <span
                    key={markerMoves}
                    className="block size-3 rounded-full bg-brand-orange motion-safe:animate-marker-stretch"
                  />
                </span>
              )}
              {features.map((feature, index) => {
                const selected = active === index;
                return (
                  <button
                    key={feature.titleKey}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => goTo(index)}
                    onKeyDown={onKeyDown}
                    className={`flex w-full flex-col gap-[15px] text-left font-bold tracking-brand transition-colors duration-[380ms] ${
                      selected
                        ? "text-brand-black"
                        : "text-[rgba(17,24,28,0.5)] hover:text-[rgba(17,24,28,0.75)]"
                    }`}
                  >
                    <span
                      ref={(el) => {
                        titleRefs.current[index] = el;
                      }}
                      className={`block w-[calc(100%-40px)] max-w-[355px] text-[22px] leading-[1.2] transition-transform duration-[520ms] ease-out-expo motion-reduce:transition-none ${
                        selected ? "translate-x-10" : ""
                      }`}
                    >
                      <T k={feature.titleKey} />
                    </span>
                    {feature.descKey && (
                      <T
                        k={feature.descKey}
                        className={`block w-[calc(100%-40px)] max-w-[355px] text-base leading-[1.3] transition-[transform,color] duration-[520ms] ease-out-expo motion-reduce:transition-none ${
                          selected
                            ? "translate-x-10 text-brand-grayFont"
                            : "text-[#A6A6AC]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative h-[570px] w-[min(647px,calc(100%-330px))] shrink-0 overflow-hidden rounded-[30px] bg-brand-gray">
            {features.map((feature, index) => (
              <div
                key={feature.titleKey}
                role="tabpanel"
                aria-hidden={active !== index}
                className={`absolute inset-0 transition-[opacity,visibility] duration-150 ${
                  active === index
                    ? "visible z-[1] opacity-100"
                    : "invisible opacity-0"
                }`}
              >
                <PanelMedia
                  feature={feature}
                  sizes="647px"
                  playing={active === index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[repeat(2,minmax(0,380px))] md:justify-center md:gap-5 lg:hidden">
        {features.map((feature) => (
          <div key={feature.titleKey} className="flex flex-col gap-5">
            <div className="relative aspect-[647/570] overflow-hidden rounded-[20px] bg-brand-gray">
              <PanelMedia
                feature={feature}
                sizes="(min-width: 768px) 380px, 100vw"
              />
            </div>
            <div className="flex flex-col gap-2.5 px-[30px] text-center font-bold tracking-brand md:px-10">
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
    </section>
  );
};

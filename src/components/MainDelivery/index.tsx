"use client";
import { useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { T } from "@/i18n/T";
import { landingContainerClassName } from "@/constants/layout";
import { SectionHeading } from "@/components/SectionHeading";
import { LoopVideo } from "@/components/LoopVideo";
import { getClientScale, getRenderScale } from "@/hooks/useLandingZoom";
import GraphIcon from "@/assets/icons/graph_violet.svg";
import Dictionary from "@/assets/images/delivery/dictionary.jpg";
import Board from "@/assets/images/delivery/board.jpg";
import Services from "@/assets/images/delivery/services.jpg";
import VideoCall from "@/assets/images/delivery/video.jpg";
import Chat from "@/assets/images/delivery/chat.jpg";

type TFeature = {
  titleKey: string;
  image: StaticImageData;
  video?: string;
};

const features: TFeature[] = [
  { titleKey: "delivery.dictionary", image: Dictionary },
  { titleKey: "delivery.board", image: Board },
  { titleKey: "delivery.services", image: Services },
  {
    titleKey: "delivery.videoCall",
    image: VideoCall,
    video: "/video/landing/delivery-videocall.mp4",
  },
  { titleKey: "delivery.chat", image: Chat },
];

export const MainDelivery = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // From tablet up the section pins and vertical scrolling slides the cards sideways.
  useEffect(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!outer || !sticky || !viewport || !track) return;
    const wide = window.matchMedia("(min-width: 768px)");
    // Layout pixels; `scale` converts them to client-rect units under the landing zoom.
    let distance = 0;
    let stickyTop = 0;
    let scale = 1;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!distance) return;
      const scrolled = stickyTop * scale - outer.getBoundingClientRect().top;
      const offset = Math.min(distance, Math.max(0, scrolled / scale));
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const measure = () => {
      if (!wide.matches) {
        distance = 0;
        outer.style.height = "";
        sticky.style.top = "";
        track.style.transform = "";
        return;
      }
      scale = getRenderScale(sticky);
      distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const height = sticky.offsetHeight;
      const viewportHeight =
        window.innerHeight / getClientScale(sticky) / scale;
      stickyTop =
        height < viewportHeight
          ? (viewportHeight - height) / 2
          : viewportHeight - height;
      sticky.style.top = `${stickyTop}px`;
      outer.style.height = `${height + distance}px`;
      update();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // The landing zoom updates on resize too, so measure on the next frame.
    const onResize = () => requestAnimationFrame(measure);

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(sticky);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <section ref={outerRef} className="relative">
      <div
        ref={stickyRef}
        className={`${landingContainerClassName} flex flex-col gap-[30px] md:sticky lg:gap-[50px]`}
      >
        <SectionHeading
          icon={
            <Image
              src={GraphIcon}
              alt=""
              className="absolute left-px top-[1.5px]"
            />
          }
          labelKey="delivery.label"
          titleKey="delivery.title"
          className="gap-[18px]"
        />
        <div
          ref={viewportRef}
          className="md:-mx-5 md:overflow-hidden lg:-mx-[65px]"
        >
          <div
            ref={trackRef}
            className="flex flex-col gap-5 will-change-transform md:w-max md:flex-row md:gap-[15px] md:px-5 lg:gap-5 lg:px-[65px]"
          >
            {features.map((feature) => (
              <div
                key={feature.titleKey}
                className="relative h-[370px] shrink-0 overflow-hidden rounded-[20px] bg-brand-gray p-[30px] md:h-[410px] md:w-[380px] lg:h-[470px] lg:w-[424px] lg:rounded-[30px] lg:p-10"
              >
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 424px, (min-width: 768px) 380px, 100vw"
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
                  className="relative text-center text-base font-bold leading-[1.2] tracking-brand text-brand-black lg:text-left lg:text-[22px] lg:leading-[1.2]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

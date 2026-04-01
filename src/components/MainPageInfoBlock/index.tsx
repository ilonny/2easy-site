import { Button, ButtonProps } from "@nextui-org/react";
import { FC, useEffect, useRef } from "react";

type TSide = {
  buttons?: ButtonProps[];
  videoSrc?: string;
  title?: string;
  description?: string;
};

type TProps = {
  flipMobileOrder?: boolean;
  sides: TSide[];
};

export const MainPageInfoBlock: FC<TProps> = ({ sides, flipMobileOrder }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry?.target?.play();
          } else {
            entry?.target?.pause();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.8,
      }
    );

    const target = videoRef.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      try {
        observer?.unobserve(target);
        observer?.disconnect(); //отключает все наблюдаемые элементы.
      } catch (err) {}
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:flex-nowrap md:items-start lg:items-center gap-3 md:gap-4 lg:gap-0">
      {sides.map((side, sideIndex) => {
        const { buttons, videoSrc, title, description } = side;
        const orderClass = flipMobileOrder
          ? sideIndex === 0
            ? "order-2 lg:order-1"
            : "order-1 lg:order-2"
          : sideIndex === 0
            ? "order-1 lg:order-1"
            : "order-2 lg:order-2";

        return (
          <div
            className={`w-full p-2 md:p-3 ${
              videoSrc
                ? "md:w-[58%] lg:w-[70%]"
                : "md:w-[42%] lg:w-[30%] flex flex-col items-center justify-center gap-2 md:items-start lg:items-center"
            } ${orderClass}`}
            key={sideIndex}
          >
            {videoSrc && (
              <div className="min-h-[200px] md:min-h-[300px] lg:min-h-[412px] rounded-lg bg-white overflow-hidden">
                <video
                  className="w-full h-auto max-h-[65vh] object-contain"
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  ref={videoRef}
                  playsInline
                >
                  <source src={videoSrc} />
                </video>
              </div>
            )}
            {!!title && (
              <p className="font-semibold text-[18px] lg:text-[24px] leading-[120%]">
                {title}
              </p>
            )}
            {!!description && (
              <>
                <div className="h-0"></div>
                <p className="font-semibold uppercase text-[14px] leading-[130%] text-[#ACACAC]">
                  {description}
                </p>
              </>
            )}
            {buttons?.length &&
              buttons.map((b, i) => {
                return <Button {...b} key={i} />;
              })}
          </div>
        );
      })}
    </div>
  );
};

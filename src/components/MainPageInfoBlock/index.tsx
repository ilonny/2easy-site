import { Button, ButtonProps } from "@nextui-org/react";
import { FC } from "react";

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
  return (
    <div className="flex items-center flex-wrap">
      {sides.map((side, sideIndex) => {
        const { buttons, videoSrc, title, description } = side;
        return (
          <div
            className={`w-[100%] p-2 ${
              videoSrc
                ? "lg:w-[70%]"
                : "lg:w-[30%] flex flex-col items-center justify-center gap-2"
            } order-${
              sideIndex === 0 && flipMobileOrder ? "2" : "1"
            } lg:order-${sideIndex + 1}`}
            key={sideIndex}
          >
            {videoSrc && (
              <div className="min-h-[300px] lg:min-h-[412px] rounded-lg bg-white">
                <video src={videoSrc} autoPlay loop muted>
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

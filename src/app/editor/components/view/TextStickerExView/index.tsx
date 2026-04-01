/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";
import { Card } from "@nextui-org/react";
import { TTextStickerData } from "../../editor/TextSticker/types";
import styles from "./styles.module.css";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TTextStickerData;
  isPreview?: boolean;
};

export const TextStickerExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">
          {data.subtitle}
        </p>
        {!!data.description && (
          <p className="exercise-view-desc">
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div className={`py-2 sm:py-4 md:py-6 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <div className="grid grid-cols-1 min-[820px]:grid-cols-2 items-stretch justify-items-stretch mx-auto w-full min-w-0 gap-2 md:gap-3 lg:gap-4">
          {data.stickers?.map((sticker, index) => {
            const count = data.stickers?.length ?? 0;
            const isSingleInRowOnTablet =
              count > 0 &&
              count % 2 === 1 &&
              index === count - 1;
            return (
              <div
                className={`min-w-0 p-2 sm:p-3 md:p-4 ${styles["card-rotate"]} ${
                  isSingleInRowOnTablet
                    ? "min-[820px]:col-span-2 min-[820px]:justify-self-center min-[820px]:w-full min-[820px]:max-w-[calc(50%-0.375rem)] lg:max-w-[calc(50%-0.5rem)]"
                    : ""
                } `}
                key={index}
              >
                <Card
                  className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 flex justify-center items-center text-center relative min-h-[150px] sm:min-h-[170px] md:min-h-[200px] lg:min-h-[240px] xl:min-h-[260px]"
                  radius="none"
                  style={{
                    overflow: "inherit",
                    backgroundColor: data.stickerBgColor || "#fff",
                  }}
                >
                  <p
                    className="absolute text-[22px] sm:text-[26px] md:text-[28px] lg:text-[30px] leading-none left-1 sm:left-1.5 top-[-16px] sm:top-[-18px] md:top-[-21px] lg:top-[-23px]"
                    aria-hidden
                  >
                    📌
                  </p>
                  <p
                    className="uppercase text-xs sm:text-sm md:text-base lg:text-lg px-0.5 sm:px-1 break-words max-w-full"
                    style={{
                      fontWeight: 500,
                      color: data.stickerTextColor || "#000",
                      lineHeight: "130%",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {sticker}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

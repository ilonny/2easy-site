/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { FC } from "react";
import { TImageExData } from "../../editor/ImageEx/types";
import ArrowIcon from "@/assets/icons/slick_arrow.svg";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TImageExData;
  isPreview?: boolean;
};

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true,
  arrows: true,
  nextArrow: (
    <div>
      <Image
        src={ArrowIcon}
        alt="ArrowIcon"
        style={{ transform: "rotate(180deg)" }}
      />
    </div>
  ),
  prevArrow: (
    <div>
      <Image src={ArrowIcon} alt="ArrowIcon" />
    </div>
  ),
};

const imgClass =
  "block w-full max-w-full h-auto max-h-[min(70vh,560px)] object-contain mx-auto";

export const ImageExView: FC<TProps> = ({ data, isPreview: _isPreview = false }) => {
  return (
    <div className="exercise-view-shell max-w-[866px] py-4 sm:py-6 md:py-7 lg:py-8">
      <div className="exercise-view-head max-w-full">
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">{data.subtitle}</p>
        {!!data.description && (
          <p className="exercise-view-desc">{data.description}</p>
        )}
      </div>

      <div className="h-6 sm:h-8" />

      <div className="w-full max-w-full min-w-0 overflow-hidden">
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full max-w-full h-[180px] sm:h-[250px] rounded-lg"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {data?.images?.length === 1 && data?.viewType === "carousel" && (
          <div className="w-full max-w-[810px] mx-auto min-w-0">
            <Zoom>
              <img
                src={data?.images[0].dataURL}
                alt=""
                className={imgClass}
              />
            </Zoom>
            {data?.images[0]?.text && (
              <p className="mt-3 text-center font-bold text-base sm:text-lg px-1 break-words">
                {data?.images[0].text}
              </p>
            )}
          </div>
        )}
        {data?.images?.length >= 2 && data?.viewType === "carousel" && (
          <>
            <div className="slider-container w-full max-w-[810px] mx-auto min-w-0 px-0 sm:px-1">
              <Slider {...settings}>
                {data?.images?.map((image) => {
                  return (
                    <div key={image.dataURL} className="w-full min-w-0 px-1 box-border">
                      <Zoom>
                        <img
                          src={image.dataURL}
                          alt=""
                          className={imgClass}
                        />
                      </Zoom>
                      {image?.text && (
                        <p className="mt-3 text-center font-bold text-base sm:text-lg px-1 break-words">
                          {image.text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </Slider>
            </div>
            <div className="h-6 sm:h-8" />
          </>
        )}
        {!!data?.images?.length && data?.viewType === "2-col" && (
          <div className="flex flex-wrap justify-center gap-y-4 gap-x-2 sm:gap-4 w-full min-w-0">
            {data?.images?.map((image) => {
              return (
                <div
                  key={image.dataURL}
                  className="w-full sm:w-[calc(50%-0.5rem)] max-w-full p-2 sm:p-4 box-border min-w-0"
                >
                  <div className="w-full overflow-hidden rounded-lg bg-neutral-50">
                    <Zoom>
                      <img
                        src={image.dataURL}
                        alt=""
                        className={imgClass}
                      />
                    </Zoom>
                  </div>
                  {image?.text && (
                    <p className="mt-2 text-center font-bold text-base sm:text-lg px-1 break-words">
                      {image.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!!data?.images?.length && data?.viewType === "3-col" && (
          <div className="flex flex-wrap justify-center gap-y-4 gap-x-1 sm:gap-2 w-full min-w-0">
            {data?.images?.map((image) => {
              return (
                <div
                  key={image.dataURL}
                  className="w-full sm:w-1/2 lg:w-1/3 max-w-full p-1 sm:p-3 box-border min-w-0"
                >
                  <div className="w-full overflow-hidden rounded-lg bg-neutral-50">
                    <Zoom>
                      <img
                        src={image.dataURL}
                        alt=""
                        className={imgClass}
                      />
                    </Zoom>
                  </div>
                  {image?.text && (
                    <p className="mt-2 text-center font-bold text-sm sm:text-base px-0.5 break-words">
                      {image.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

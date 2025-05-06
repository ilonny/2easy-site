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

export const ImageExView: FC<TProps> = ({ data, isPreview = false }) => {
  return (
    <div className={`py-8 w-[886px] m-auto`}>
      <p
        style={{
          color: data.titleColor,
          fontSize: 38,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.title}
      </p>
      <p
        style={{
          fontSize: 24,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.subtitle}
      </p>
      {!!data.description && (
        <p
          style={{
            fontSize: 20,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {data.description}
        </p>
      )}
      <div className="h-10" />
      <div className={`py-8 w-[886px] m-auto`} style={{ margin: "0 auto" }}>
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {data?.images?.length === 1 && data?.viewType === "carousel" && (
          <div className="max-w-[810px] m-auto">
            <Zoom>
              <img
                src={data?.images[0].dataURL}
                alt="image"
                className="max-w-[810px]"
              />
            </Zoom>
            {data?.images[0]?.text && (
              <p
                className="mt-2 text-center font-bold"
                style={{ fontSize: 18 }}
              >
                {data?.images[0].text}
              </p>
            )}
          </div>
        )}
        {data?.images?.length >= 2 && data?.viewType === "carousel" && (
          <>
            <div className="slider-container">
              <Slider {...settings}>
                {data?.images?.map((image) => {
                  return (
                    <div key={image.dataURL} className="max-w-[810px]">
                      <Zoom>
                        <img
                          src={image.dataURL}
                          alt="image"
                          className="max-w-[810px]"
                        />
                      </Zoom>
                      {image?.text && (
                        <p
                          className="mt-2 text-center font-bold"
                          style={{ fontSize: 18 }}
                        >
                          {image.text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </Slider>
            </div>
            <div className="h-10" />
          </>
        )}
        {!!data?.images?.length && data?.viewType === "2-col" && (
          <div className="flex flex-wrap justify-center">
            {data?.images?.map((image) => {
              return (
                <div key={image.dataURL} className="w-[50%] p-4">
                  <Zoom>
                    <img src={image.dataURL} alt="image" />
                  </Zoom>
                  {image?.text && (
                    <p
                      className="mt-2 text-center font-bold"
                      style={{ fontSize: 18 }}
                    >
                      {image.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!!data?.images?.length && data?.viewType === "3-col" && (
          <div className="flex flex-wrap justify-center">
            {data?.images?.map((image) => {
              return (
                <div key={image.dataURL} className="w-[33.3333333%] p-4">
                  <Zoom>
                    <img src={image.dataURL} alt="image" />
                  </Zoom>
                  {image?.text && (
                    <p
                      className="mt-2 text-center font-bold"
                      style={{ fontSize: 18 }}
                    >
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

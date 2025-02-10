/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { FC } from "react";
import { TImageExData } from "../../editor/ImageEx/types";

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
};

export const ImageExView: FC<TProps> = ({ data, isPreview = false }) => {
  console.log("Preview data", data);
  return (
    <div
      style={{ border: "1px solid #3F28C6", borderRadius: 4 }}
      className="p-8"
    >
      <p
        style={{
          color: data.titleColor,
          fontSize: 22,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.title}
      </p>
      <p
        style={{
          fontSize: 14,
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
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {data.description}
        </p>
      )}
      <div className="h-10" />
      <div
        className={isPreview ? "w-[430px]" : ""}
        style={{ margin: "0 auto" }}
      >
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {!!data?.images?.length && data?.viewType === "carousel" && (
          <>
            <div className="slider-container">
              <Slider {...settings}>
                {data?.images?.map((image) => {
                  return (
                    <div key={image.dataURL}>
                      <img src={image.dataURL} alt="image" />
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
          <div className="flex flex-wrap">
            {data?.images?.map((image) => {
              return (
                <div key={image.dataURL} className="w-[50%] p-4">
                  <img src={image.dataURL} alt="image" />
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
          <div className="flex flex-wrap">
            {data?.images?.map((image) => {
              return (
                <div key={image.dataURL} className="w-[33.3333333%] p-4">
                  <img src={image.dataURL} alt="image" />
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

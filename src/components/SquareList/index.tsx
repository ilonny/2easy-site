/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ArrowIcon from "@/assets/icons/slick_arrow.svg";
import LinkArrow from "@/assets/icons/link_arrow.svg";
import Image from "next/image";
import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useState } from "react";
import { Button } from "@nextui-org/react";

export type TSquare = {
  title?: string;
  bgImage?: any;
  answerImage?: any;
  bgColor?: string;
  link?: string;
  description?: string;
  isGallery?: boolean;
  label?: string;
};

type TProps = {
  data: TSquare[];
  squareWidth?: string;
  squareHeight?: string;
  isGallery?: boolean;
  isCarousel?: boolean;
  withToggle?: boolean;
  hideDots?: boolean;
  toggleLabel?: string[];
  hideThumbnails?: boolean;
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

export const SquareList = (props: TProps) => {
  const {
    data,
    squareWidth,
    squareHeight,
    isGallery,
    isCarousel,
    withToggle,
    hideDots,
    toggleLabel,
    hideThumbnails,
  } = props;
  const [toggleIsOpen, setToggleIsOpen] = useState(withToggle ? false : true);

  if (isCarousel) {
    if (data.length === 1) {
      const image = data[0];
      return (
        <div key={image.bgImage.src} className="max-w-[810px]  m-auto">
          <Zoom>
            <img
              src={image.bgImage.src}
              alt="image"
              className="max-w-[810px]"
            />
          </Zoom>
          {image?.label && (
            <p className="mt-2 text-center font-bold" style={{ fontSize: 18 }}>
              {image.label}
            </p>
          )}
        </div>
      );
    }
    return (
      <>
        <div className="slider-container">
          <Slider {...settings} dots={hideDots ? false : true}>
            {data?.map((image) => {
              return (
                <div
                  key={image.bgImage.src}
                  className="w-[100%] max-w-[810px] m-auto"
                >
                  <Zoom>
                    <img
                      src={image.bgImage.src}
                      alt="image"
                      className="w-[100%] max-w-[810px]"
                    />
                  </Zoom>
                  {image?.label && (
                    <p
                      className="mt-2 text-center font-bold"
                      style={{ fontSize: 18 }}
                    >
                      {image.label}
                    </p>
                  )}
                </div>
              );
            })}
          </Slider>
        </div>
        <div className="h-10" />
      </>
    );
  }

  if (isGallery) {
    return (
      <>
        {withToggle && (
          <>
            <div className="flex justify-center">
              <Button
                onClick={() => setToggleIsOpen(!toggleIsOpen)}
                size="lg"
                color="primary"
              >
                {toggleIsOpen
                  ? toggleLabel
                    ? toggleLabel[1]
                    : "HIDE ALL CARDS"
                  : toggleLabel
                  ? toggleLabel[0]
                  : "SHOW ALL CARDS"}
              </Button>
            </div>
            <div className="h-10"></div>
          </>
        )}
        {toggleIsOpen && (
          <div
            className={`flex flex-wrap wrap ${
              data.length === 1 && "justify-center"
            }`}
          >
            <Gallery
              id="my-gallery"
              options={
                {
                  // padding: { top: 300, bottom: 300, left: 300, right: 300 },
                  // zoom: true,
                  // initialZoomLevel: "fit",
                  // spacing: 0.5,
                }
              }
            >
              {data.map((s, index) => {
                return (
                  <div
                    className={`p-2 mb-4 w-[100%] lg:w-[${
                      squareWidth ? squareWidth : "25%"
                    }]`}
                    key={s.title}
                    style={{
                      minHeight: squareHeight ? squareHeight : "320px",
                    }}
                  >
                    <Item<HTMLImageElement>
                      original={s.answerImage.src || s.bgImage.src}
                      thumbnail={s.answerImage.src || s.bgImage.src}
                      width={s.answerImage.width || s.bgImage.width} // ширина исходного изображения в px
                      height={s.answerImage.height || s.bgImage.height}
                    >
                      {({ ref, open }) => {
                        if (hideThumbnails) {
                          return (
                            <div
                              ref={ref}
                              onClick={open}
                              style={{
                                background:
                                  "linear-gradient(0turn,rgba(48,63,197,1) 0%,rgba(37,89,138,1) 100%)",
                                height: "100%",
                                cursor: "pointer",
                              }}
                              className="flex items-center justify-center"
                            >
                              <p
                                style={{
                                  fontSize: 40,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                {index + 1}
                              </p>
                            </div>
                          );
                        }
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="image"
                            style={{ cursor: "pointer", margin: "auto" }}
                            src={s.answerImage.src || s.bgImage.src}
                            // width={300}
                            // height={300}
                            ref={ref}
                            onClick={open}
                          />
                        );
                      }}
                    </Item>
                  </div>
                );
              })}
            </Gallery>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-wrap wrap">
      {data.map((s) => {
        return (
          <div
            className={`p-2 mb-4 w-[100%] lg:w-[${
              squareWidth ? squareWidth : "25%"
            }]`}
            key={s.title}
            style={{
              minHeight: squareHeight ? squareHeight : "320px",
            }}
          >
            <a href={s.link ? s.link : "#"}>
              <div
                className="square items-center justify-center h-full flex flex-col gap-2"
                style={{
                  background: s.bgImage
                    ? `url(${s["bgImage"].src}) center center no-repeat`
                    : s.bgColor
                    ? s.bgColor
                    : "",
                  backgroundSize: "contain",
                  borderRadius: 10,
                }}
              >
                <p
                  style={{
                    fontWeight: 600,
                    textAlign: "center",
                    fontSize: 30,
                    textTransform: "uppercase",
                    color: "#fff",
                    margin: "0 20px",
                    lineHeight: "30px",
                  }}
                >
                  {s.title}
                </p>
                {!!s.description && (
                  <p
                    style={{
                      // fontWeight: 600,
                      textAlign: "center",
                      fontSize: 25,
                      color: "#fff",
                      margin: "0 20px",
                      lineHeight: "30px",
                      fontStyle: "italic",
                    }}
                  >
                    {s.description}
                  </p>
                )}
              </div>
              {!!s.link && (
                <div
                  className="flex gap-2 justify-end"
                  style={{ color: "#3f28c6" }}
                >
                  <p>Открыть</p>
                  <Image
                    src={LinkArrow}
                    alt="arrow"
                    style={{ transform: "rotate(315deg)", width: 16 }}
                  />
                </div>
              )}
            </a>
          </div>
        );
      })}
    </div>
  );
};

/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";
import { Card } from "@nextui-org/react";
import { TTextStickerData } from "../../editor/TextSticker/types";
import styles from "./styles.module.css";
type TProps = {
  data: TTextStickerData;
  isPreview?: boolean;
};

export const TextStickerExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];

  return (
    <>
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
      </div>
      <div
        className={`py-8 w-[886px] m-auto`}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
        <div
          className={` flex items-center justify-center flex-wrap`}
          style={{ margin: "0 auto" }}
        >
          {data.stickers?.map((sticker, index) => {
            return (
              <div
                className={`w-[50%] shrink-0 p-4 ${styles["card-rotate"]} `}
                key={index}
              >
                <Card
                  className={`p-10 flex justify-center items-center text-center  relative`}
                  radius="none"
                  style={{
                    overflow: "inherit",
                    backgroundColor: data.stickerBgColor || "#fff",
                    minHeight: 260,
                  }}
                >
                  <p
                    style={{
                      fontSize: 30,
                      position: "absolute",
                      left: 6,
                      top: -23,
                    }}
                  >
                    📌
                  </p>
                  <p
                    className="uppercase"
                    style={{
                      fontWeight: 500,
                      color: data.stickerTextColor || "#000",
                      lineHeight: "130%",
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
    </>
  );
};

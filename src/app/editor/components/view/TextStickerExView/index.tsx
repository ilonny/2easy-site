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
      <div className="p-8 px-24">
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
        className={`p-8 ${isPreview ? "pt-4" : "p-18"} px-24 `}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
        {/* ${
            !isPreview && "w-[740px]"
          } */}
        <div
          className={` flex items-center justify-center flex-wrap`}
          style={{ margin: "0 auto" }}
        >
          {data.stickers?.map((sticker, index) => {
            return (
              <div
                className={`w-[50%] shrink-0 p-4 ${styles["card-rotate"]}`}
                key={index}
              >
                <Card
                  className={`p-4 flex justify-center items-center text-center min-h-[200px] relative `}
                  radius="none"
                  style={{
                    overflow: "inherit",
                    backgroundColor: data.stickerBgColor || "#fff",
                  }}
                >
                  <p
                    style={{
                      fontSize: 24,
                      position: "absolute",
                      left: 13,
                      top: -17,
                    }}
                  >
                    📌
                  </p>
                  <p
                    className="uppercase"
                    style={{
                      fontWeight: 600,
                      color: data.stickerTextColor || "#000",
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

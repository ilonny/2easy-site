/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { Card, Checkbox } from "@nextui-org/react";
import { TTextStickerData } from "../../editor/TextSticker/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TTextStickerData;
  isPreview?: boolean;
};

export const TextChecklistExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];

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
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[886px] m-auto`}>
        <div
          className={` flex items-stretch justify-center flex-wrap`}
          style={{ margin: "0 auto" }}
        >
          <div className="w-[50%]  shrink-0 p-2 ">
            <Card className={`w-full p-4 flex-col gap-2 h-full`}>
              {data.stickers?.map((sticker, index) => {
                if (!sticker) {
                  return <></>;
                }
                return (
                  <label
                    className="flex items-baseline gap-2"
                    key={index}
                    style={{ cursor: "pointer" }}
                  >
                    <Checkbox size="lg" color="primary" />
                    <p style={{ fontSize: 18 }}>{sticker}</p>
                  </label>
                );
              })}
            </Card>
          </div>
          {!!editorImage && (
            <div className="w-[50%]  shrink-0 p-2">
              <Card className={`w-full h-full`}>
                {!!editorImage && (
                  <img
                    src={editorImage.dataURL}
                    style={{ margin: "auto", width: "100%" }}
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

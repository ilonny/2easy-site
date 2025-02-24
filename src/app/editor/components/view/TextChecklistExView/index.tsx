/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { Card, Checkbox } from "@nextui-org/react";
import { TTextStickerData } from "../../editor/TextSticker/types";

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
                    <Checkbox size="lg" color="success" />
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

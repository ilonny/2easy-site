/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { TTextDefaultData } from "../../editor/TextDefault/types";
import { Card } from "@nextui-org/react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TTextDefaultData;
  isPreview?: boolean;
};

export const TextDefaultExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];
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
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <Card
          className={`p-4 sm:p-6 md:p-8 lg:p-10 editor-view`}
          style={{
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: 14,
            wordBreak: "break-word",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {!!editorImage && (
            <img
              src={editorImage.dataURL}
              alt=""
              className="mb-4 sm:mb-6 w-full max-w-full h-auto object-contain"
            />
          )}
          <div
            dangerouslySetInnerHTML={{ __html: data?.content }}
            className="editorClassName"
          />
          {/* {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )} */}
        </Card>
      </div>
    </div>
  );
};

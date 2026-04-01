/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";

import { Card } from "@nextui-org/react";
import { TText2ColData } from "../../editor/Text2Col/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TText2ColData;
  isPreview?: boolean;
};

export const Text2ColExView: FC<TProps> = ({ data, isPreview: _isPreview = false }) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];
  const secondEditorImage = data?.secondEditorImages?.[0];
  return (
    <div className="exercise-view-shell max-w-[886px] py-4 sm:py-6 md:py-7 lg:py-8">
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
      {!!image && (
        <div className="mt-4 w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block w-full max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div className="mt-6 sm:mt-8 w-full max-w-full min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-5 lg:gap-4 w-full min-w-0">
          <div className="w-full lg:w-1/2 min-w-0 p-0 sm:p-1">
            <Card
              className="w-full min-w-0 max-w-full p-4 sm:p-5 editor-view"
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
              }}
            >
              {!!editorImage && (
                <img
                  src={editorImage.dataURL}
                  alt=""
                  className="mb-4 w-full max-w-full h-auto object-contain rounded-md"
                />
              )}
              <div
                dangerouslySetInnerHTML={{ __html: data?.content }}
                className="editorClassName break-words [overflow-wrap:anywhere]"
              />
            </Card>
          </div>
          <div className="w-full lg:w-1/2 min-w-0 p-0 sm:p-1">
            <Card
              className="w-full min-w-0 max-w-full p-4 sm:p-5 editor-view"
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
              }}
            >
              {!!secondEditorImage && (
                <img
                  src={secondEditorImage.dataURL}
                  alt=""
                  className="mb-4 w-full max-w-full h-auto object-contain rounded-md"
                />
              )}
              <div
                dangerouslySetInnerHTML={{ __html: data?.secondContent }}
                className="editorClassName break-words [overflow-wrap:anywhere]"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

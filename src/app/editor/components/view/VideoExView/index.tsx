/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC, memo } from "react";
import { Card } from "@nextui-org/react";
import { TVideoData } from "../../editor/Video/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TVideoData;
  isPreview?: boolean;
};

const VideoExViewComp: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];

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
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 mx-auto w-full min-w-0">
          {data.videos?.map((video, index) => {
            return (
              <div key={index} className="w-full min-w-0">
                <div
                  className="flex justify-center w-full max-w-full min-w-0 [&_iframe]:max-w-full [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto"
                  dangerouslySetInnerHTML={{ __html: video?.content }}
                />
                {!!video.title && (
                  <p className="text-center mt-2 text-base sm:text-lg font-semibold break-words px-1">
                    {video.title}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const VideoExView = memo(VideoExViewComp);

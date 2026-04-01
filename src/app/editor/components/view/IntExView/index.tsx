/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC, memo } from "react";
import { TIntData } from "../../editor/Int/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TIntData;
  isPreview?: boolean;
};

const IntExViewComp: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`pt-4 sm:pt-6 md:pt-7 lg:pt-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        {!!data.subtitle && (
          <p className="exercise-view-subtitle">{data.subtitle}</p>
        )}
        {!!data.description && (
          <p className="exercise-view-desc">
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <Zoom>
          <img
            src={image.dataURL}
            className="max-h-[220px] sm:max-h-[300px] md:max-h-[360px] lg:max-h-[400px] w-auto mx-auto object-contain"
            alt=""
          />
        </Zoom>
      )}
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 mx-auto w-full min-w-0">
          <div
            className="flex justify-center w-full max-w-full min-w-0 min-h-[min(42vh,360px)] sm:min-h-[min(55vh,440px)] md:min-h-[min(70vh,500px)] [&_iframe]:max-w-full [&_iframe]:w-full"
            dangerouslySetInnerHTML={{ __html: data?.iframe }}
          />
        </div>
      </div>
    </div>
  );
};

export const IntExView = memo(IntExViewComp);

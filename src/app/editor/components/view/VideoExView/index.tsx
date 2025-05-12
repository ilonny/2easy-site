/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";
import { Card } from "@nextui-org/react";
import { TVideoData } from "../../editor/Video/types";
import styles from "./styles.module.css";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TVideoData;
  isPreview?: boolean;
};

export const VideoExView: FC<TProps> = ({ data, isPreview = false }) => {
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
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[886px] m-auto`}>
        <div style={{ margin: "0 auto" }} className="flex flex-col gap-10">
          {data.videos?.map((video, index) => {
            return (
              <div key={index}>
                <div
                  className="flex justify-center"
                  dangerouslySetInnerHTML={{ __html: video?.content }}
                />
                {!!video.title && (
                  <p
                    className="text-center mt-2"
                    style={{ fontSize: 18, fontWeight: 600 }}
                  >
                    {video.title}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC, memo, useEffect, useMemo, useState } from "react";
import { TVideoData, TVideoItem } from "../../editor/Video/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getImageUrl } from "@/app/editor/helpers";
import { getImageNameFromPath } from "../../editor/mappers";

type TProps = {
  data: TVideoData;
  isPreview?: boolean;
};

const isFileSource = (video?: TVideoItem) => {
  if (!video) return false;
  if (video.source === "file") return true;
  if (video.attachment?.file || video.attachment?.path || video.attachment?.dataURL) {
    return true;
  }
  return false;
};

const VideoItemView: FC<{ video: TVideoItem }> = ({ video }) => {
  const attachment = video.attachment;
  const pickedFile = attachment?.file;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pickedFile instanceof Blob) {
      const u = URL.createObjectURL(pickedFile);
      setBlobUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setBlobUrl(null);
    return undefined;
  }, [pickedFile]);

  const fileSrc = useMemo(() => {
    if (attachment?.dataURL) return attachment.dataURL;
    if (blobUrl) return blobUrl;
    if (typeof attachment?.path === "string" && attachment.path) {
      return getImageUrl(attachment.path);
    }
    return "";
  }, [attachment?.dataURL, attachment?.path, blobUrl]);

  if (isFileSource(video)) {
    if (!fileSrc) return null;
    return (
      <VideoPlayer
        src={fileSrc}
        title={
          video.title ||
          attachment?.name ||
          getImageNameFromPath(attachment?.path) ||
          undefined
        }
      />
    );
  }

  if (!video?.content) return null;

  return (
    <div
      className="w-full min-w-0 [&_.videos-container]:!max-w-none [&_.videos-container]:w-full [&_.video-item]:!w-full [&_.video-item]:!max-w-full [&_.video-item]:min-w-0 md:[&_.video-item]:flex-1 [&_iframe]:block [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:min-h-[200px] sm:[&_iframe]:min-h-[280px] md:[&_iframe]:min-h-[450px] [&_iframe]:border-0 [&_video]:block [&_video]:h-auto [&_video]:w-full [&_video]:max-w-full"
      dangerouslySetInnerHTML={{ __html: video.content }}
    />
  );
};

const VideoExViewComp: FC<TProps> = ({ data }) => {
  const image = data?.images?.[0];
  const videoCount = data.videos?.length ?? 0;
  const videoLayoutClass =
    videoCount > 1
      ? "grid w-full grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
      : "flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10";

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div
        className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}
      >
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
      <div
        className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}
      >
        <div className={`${videoLayoutClass} mx-auto w-full min-w-0`}>
          {data.videos?.map((video, index) => {
            return (
              <div key={index} className="w-full min-w-0">
                <VideoItemView video={video} />
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

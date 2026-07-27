"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TVideoData, TVideoItem, TVideoSource } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Progress } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import Close from "@/assets/icons/close.svg";
import { useUploadVideoEx } from "../hooks/useUploadVideoEx";
import InfoIcon from "@/assets/icons/info.svg";
import { VideoExView } from "../../view/VideoExView";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { getImageNameFromPath } from "../mappers";
import { VideoFileDropzone, formatMb } from "./VideoFileDropzone";

const emptyVideo = (): TVideoItem => ({
  content: "",
  title: "",
  source: "link",
});

const defaultValuesStub: TVideoData = {
  title: "Let's watch!",
  titleColor: "#3F28C6",
  subtitle: "Watch the video and answer the questions below",
  description: "",
  images: [],
  videos: [emptyVideo()],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const Video: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveVideoEx, success, uploadProgress } = useUploadVideoEx(
    lastSortIndex,
    currentSortIndexToShift,
  );
  const { data, changeData, resetData, setData } = useExData<TVideoData>(
    defaultValues || defaultValuesStub,
  );
  const [images, setImages] = useState<TVideoData["images"]>(
    defaultValues?.images || [],
  );
  const [fileErrors, setFileErrors] = useState<Record<number, string | null>>(
    {},
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Let's watch!",
        titleColor: "#3F28C6",
        subtitle: "Watch the video and answer the questions below",
        description: "",
        images: [],
        videos: [emptyVideo()],
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const onDeleteVideo = useCallback(
    (index: number) => {
      const videos = data.videos.filter((_s, i) => i !== index);
      if (!videos.length) {
        changeData("videos", [emptyVideo()]);
        return;
      }
      changeData("videos", videos);
      setFileErrors({});
    },
    [changeData, data.videos],
  );

  const createSticker = useCallback(() => {
    const videos = data.videos.concat(emptyVideo());
    changeData("videos", videos);
  }, [changeData, data.videos]);

  const updateVideo = useCallback(
    (index: number, patch: Partial<TVideoItem>) => {
      const videos = [...(data.videos || [])];
      videos[index] = { ...videos[index], ...patch };
      changeData("videos", videos);
    },
    [changeData, data.videos],
  );

  const setVideoSource = useCallback(
    (index: number, source: TVideoSource) => {
      const current = data.videos[index] || emptyVideo();
      if (source === "file") {
        updateVideo(index, {
          source: "file",
          attachment: current.attachment,
        });
        return;
      }
      updateVideo(index, {
        source: "link",
        attachment: undefined,
      });
      setFileErrors((prev) => ({ ...prev, [index]: null }));
    },
    [data.videos, updateVideo],
  );

  const onChangeSticker = useCallback(
    (text: string, index: number, key: "content" | "title") => {
      if (
        key === "content" &&
        !text.includes("iframe") &&
        (text.includes("youtube.com") || text.includes("youtu.be"))
      ) {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|shorts\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = text.match(regExp);
        const id = match && match[2].length === 11 ? match[2] : null;
        if (!id) {
          return text;
        }
        text =
          '<iframe width="100%" height="500" src="//www.youtube.com/embed/' +
          id +
          '" frameborder="0" allowfullscreen></iframe>';
      }
      if (
        key === "content" &&
        !text.includes("iframe") &&
        text.includes("rutube.ru/video")
      ) {
        const id = text.split("/").reverse()[1];
        text = `<iframe width="100%" height="500" src="https://rutube.ru/play/embed/${id}/" frameBorder="0" allow="clipboard-write; fullscreen" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
      }
      if (
        key === "content" &&
        !text.includes("iframe") &&
        text.includes("vkvideo.ru")
      ) {
        const oid = text.split("video-")[1].split("_")[0];
        const id = text.split("video-")[1].split("_")[1];
        text = `<iframe src="https://vkvideo.ru/video_ext.php?oid=-${oid}&id=${id}&hd=2&autoplay=0" width="100%" height="500" allow="encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>`;
      }
      data.videos[index][key] = text;
      if (key === "content") {
        data.videos[index].source = "link";
        data.videos[index].attachment = undefined;
      }
      changeData("videos", [...data.videos]);
    },
    [data?.videos, changeData],
  );

  const assignFile = useCallback(
    (index: number, file: File) => {
      setData((prev) => {
        const videos = [...(prev.videos || [])];
        const current = videos[index] || emptyVideo();
        videos[index] = {
          ...current,
          source: "file",
          attachment: {
            file,
            name: file.name,
          },
        };
        return { ...prev, videos };
      });
      setFileErrors((prev) => ({ ...prev, [index]: null }));
    },
    [setData],
  );

  const clearVideoFile = (index: number) => {
    updateVideo(index, {
      source: "file",
      attachment: undefined,
      content: "",
    });
  };

  const progressPercent =
    uploadProgress && uploadProgress.total > 0
      ? Math.min(
          100,
          Math.round((uploadProgress.loaded / uploadProgress.total) * 100),
        )
      : 0;

  return (
    <div>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-0">
        <div className="w-full md:w-1/2 md:pr-2 min-w-0">
          <TitleExInput
            label={<T k="editor.taskTitle" defaultText="Заголовок задания" />}
            value={data.title}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={data.titleColor}
          />
          <div className="h-4" />
          <TitleExInput
            label={
              <T k="editor.taskSubtitle" defaultText="Подзаголовок задания" />
            }
            value={data.subtitle}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label={<T k="editor.description" defaultText="Описание" />}
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 min-w-0">
          <p className="font-light mb-2">
            <T k="editor.imageForTask" defaultText="Изображение для задания" />
          </p>
          <ImageUpload
            images={images}
            setImages={setImages}
            customPlaceHolder={
              <div
                style={{
                  width: "100%",
                  background: "#fff",
                  height: 200,
                  borderRadius: 10,
                }}
                className="flex items-center justify-center flex-col gap-4"
              >
                <Image src={GalleryIcon} alt="GalleryIcon" />
                <p
                  className="text-small text-center max-w-[250px]"
                  style={{ color: "#B7B7B7" }}
                >
                  <T
                    k="editor.dragImagesHere"
                    defaultText="Нажмите на этот блок или перетащите сюда изображения"
                  />
                </p>
              </div>
            }
          />
        </div>
      </div>
      <div className="h-5" />
      <div className="flex flex-wrap items-start justify-between">
        {data.videos?.map((video, index) => {
          const source: TVideoSource =
            video.source === "file" ||
            !!video.attachment?.file ||
            !!video.attachment?.path
              ? "file"
              : "link";
          const isFile = source === "file";
          const fileName =
            video.attachment?.name ||
            (video.attachment?.file instanceof File
              ? video.attachment.file.name
              : "") ||
            getImageNameFromPath(video.attachment?.path) ||
            "";
          const isUploadingThis =
            isLoading &&
            uploadProgress &&
            uploadProgress.videoIndex === index;

          return (
            <div key={index} className="w-[100%] mb-4">
              <div className="">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      <T
                        k="editor.videoSource"
                        defaultText="Источник видео"
                      />
                    </p>
                  </div>
                  <Button
                    isIconOnly
                    onClick={() => onDeleteVideo(index)}
                    variant="light"
                    className="hover:!bg-transparent"
                    size="md"
                    isDisabled={isLoading}
                  >
                    <Image priority={false} src={Close} alt="close" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Button
                    size="sm"
                    variant={!isFile ? "solid" : "bordered"}
                    color="primary"
                    onClick={() => setVideoSource(index, "link")}
                    isDisabled={isLoading}
                  >
                    <T k="editor.videoFromLink" defaultText="Ссылка (iframe)" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isFile ? "solid" : "bordered"}
                    color="primary"
                    onClick={() => setVideoSource(index, "file")}
                    isDisabled={isLoading}
                  >
                    <T
                      k="editor.videoFromDevice"
                      defaultText="Загрузить с устройства"
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <p>
                    <T k="editor.videoLink" defaultText="Ссылка на видео" />
                  </p>
                  <ResponsiveTooltip
                    content={i18n.t("editor.videoLinkHint", {
                      defaultValue: (i18n.language || "")
                        .toLowerCase()
                        .startsWith("ru")
                        ? "Вставьте ссылку на видео из Youtube, Vk Видео, Vimeo, Rutube, Google Drive или TED через кнопку «поделиться»."
                        : "Insert the link to the video from YouTube, VK Video, Vimeo, Rutube, Google Drive, or TED using the 'Share' button.",
                    })}
                    classNames={{
                      base: ["before:bg-neutral-400 dark:before:bg-white"],
                      content: [
                        "py-2 px-4 shadow-xl",
                        "text-black bg-white max-w-[255px]",
                      ],
                    }}
                    placement="right-end"
                    color="foreground"
                  >
                    <Image src={InfoIcon} alt="InfoIcon" />
                  </ResponsiveTooltip>
                </div>
                <div className="flex my-2 gap-4">
                  <Input
                    value={isFile ? "" : video.content}
                    onChange={(e) =>
                      onChangeSticker(e.target.value, index, "content")
                    }
                    isDisabled={isFile || isLoading}
                    placeholder={
                      isFile
                        ? i18n.t("editor.videoLinkDisabledHint", {
                            defaultValue: (i18n.language || "")
                              .toLowerCase()
                              .startsWith("ru")
                              ? "Недоступно при загрузке с устройства"
                              : "Unavailable when uploading from device",
                          })
                        : undefined
                    }
                    classNames={{ inputWrapper: "bg-white" }}
                  />
                </div>

                {isFile && (
                  <>
                    <VideoFileDropzone
                      fileName={fileName}
                      error={fileErrors[index]}
                      disabled={isLoading}
                      onFile={(file) => assignFile(index, file)}
                      onClear={() => clearVideoFile(index)}
                      onError={(message) =>
                        setFileErrors((prev) => ({
                          ...prev,
                          [index]: message,
                        }))
                      }
                    />
                    {isUploadingThis && uploadProgress && (
                      <div className="mb-3 rounded-xl border border-[#D0CBE8] bg-white p-3">
                        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                          <p className="min-w-0 truncate text-[#3F28C6] font-medium">
                            {uploadProgress.fileName}
                          </p>
                          <p className="shrink-0 tabular-nums text-default-600">
                            {formatMb(uploadProgress.loaded)}{" "}
                            <T k="editor.videoUploadOf" defaultText="из" />{" "}
                            {formatMb(uploadProgress.total)}{" "}
                            <T k="editor.videoUploadMb" defaultText="МБ" />
                          </p>
                        </div>
                        <Progress
                          aria-label="upload progress"
                          value={progressPercent}
                          classNames={{
                            indicator: "bg-[#3F28C6]",
                            track: "bg-[#EDE9FB]",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                <p>
                  <T k="editor.videoTitle" defaultText="Название видео" />
                </p>
                <div className="flex mt-2 gap-4">
                  <Input
                    value={video.title}
                    onChange={(e) =>
                      onChangeSticker(e.target.value, index, "title")
                    }
                    isDisabled={isLoading}
                    classNames={{ inputWrapper: "bg-white" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4">
        {data.videos?.length < 6 && (
          <div className="flex justify-center">
            <Button
              variant="light"
              onClick={() => createSticker()}
              color="primary"
              className="w-[300px]"
              size="lg"
              isDisabled={isLoading}
            >
              <T k="editor.addMoreVideo" defaultText="+ Добавить еще видео" />
            </Button>
          </div>
        )}
      </div>
      <div className="h-10" />
      <div>
        <p className="font-light mb-2">
          <T k="editor.preview" defaultText="Превью" />
        </p>
        <div
          style={{
            border: "1px solid #3F28C6",
            borderRadius: 4,
            background: "#fff",
          }}
        >
          <VideoExView data={data} isPreview />
        </div>
        <div className="h-5" />
        {isLoading && uploadProgress && (
          <div className="mb-4 mx-auto w-full max-w-[480px] rounded-xl border border-[#D0CBE8] bg-white p-4">
            <p className="mb-1 text-sm font-medium text-[#3F28C6]">
              <T
                k="editor.videoUploading"
                defaultText="Загрузка видео на сервер…"
              />
            </p>
            <div className="mb-2 flex items-center justify-between gap-2 text-sm">
              <p className="min-w-0 truncate text-default-600">
                {uploadProgress.fileName}
              </p>
              <p className="shrink-0 tabular-nums text-default-700">
                {formatMb(uploadProgress.loaded)}{" "}
                <T k="editor.videoUploadOf" defaultText="из" />{" "}
                {formatMb(uploadProgress.total)}{" "}
                <T k="editor.videoUploadMb" defaultText="МБ" />
              </p>
            </div>
            <Progress
              aria-label="upload progress"
              value={progressPercent}
              classNames={{
                indicator: "bg-[#3F28C6]",
                track: "bg-[#EDE9FB]",
              }}
            />
          </div>
        )}
        <div className="flex justify-center">
          <Button
            color="primary"
            className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
            size="lg"
            onClick={() => saveVideoEx(data)}
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            <T k="common.save" defaultText="Сохранить" />
          </Button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
};

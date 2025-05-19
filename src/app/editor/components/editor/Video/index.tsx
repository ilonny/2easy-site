"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TVideoData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Textarea, Tooltip } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { useUploadVideoEx } from "../hooks/useUploadVideoEx";
import InfoIcon from "@/assets/icons/info.svg";
import { VideoExView } from "../../view/VideoExView";

const defaultValuesStub: TVideoData = {
  title: "Let's watch!",
  titleColor: "#3F28C6",
  subtitle: "Watch the video and answer the questions below",
  description: "",
  images: [],
  videos: [{ content: "", title: "" }],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const Video: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveVideoEx, success } = useUploadVideoEx(lastSortIndex);
  const { data, changeData, resetData } = useExData<TVideoData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TVideoData["images"]>(
    defaultValues?.images || []
  );

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
        changeData("videos", [{ content: "", title: "" }]);
        return;
      }
      changeData("videos", videos);
    },
    [changeData, data.videos]
  );

  const createSticker = useCallback(() => {
    const videos = data.videos.concat({ content: "", title: "" });
    changeData("videos", videos);
  }, [changeData, data.videos]);

  const onChangeSticker = useCallback(
    (text: string, index: number, key: "content" | "title") => {
      if (
        key === "content" &&
        !text.includes("iframe") &&
        (text.includes("youtube.com") || text.includes("youtu.be"))
      ) {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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
        text = `<iframe width="100%" height="500" src="https://rutube.ru/play/embed/${id}/" frameBorder="0" allow="clipboard-write; autoplay" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
      }
      if (
        key === "content" &&
        !text.includes("iframe") &&
        text.includes("vkvideo.ru")
      ) {
        const oid = text.split("video-")[1].split("_")[0];
        const id = text.split("video-")[1].split("_")[1];
        text = `<iframe src="https://vkvideo.ru/video_ext.php?oid=-${oid}&id=${id}&hd=2&autoplay=1" width="100%" height="500" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>`;
      }
      data.videos[index][key] = text;
      changeData("videos", [...data.videos]);
    },
    [data?.videos, changeData]
  );

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-[50%] pr-2">
          <TitleExInput
            label="Заголовок задания"
            value={data.title}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={data.titleColor}
          />
          <div className="h-4" />
          <TitleExInput
            label="Подзаголовок задания"
            value={data.subtitle}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label="Описание"
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-[50%] pl-2">
          <p className="font-light mb-2">Изображение для задания</p>
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
                  Нажмите на этот блок или перетащите сюда изображения
                </p>
              </div>
            }
          />
        </div>
      </div>
      <div className="h-5" />
      <div className="flex flex-wrap items-start justify-between">
        {data.videos?.map((video, index) => {
          return (
            <div key={index} className="w-[100%] mb-4">
              <div className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p>Ссылка на видео</p>
                    <Tooltip
                      content="Вставьте ссылку на видео из Youtube, Vk Видео, Vimeo, Rutube, Google Drive или TED через кнопку “поделиться”."
                      classNames={{
                        base: [
                          // arrow color
                          "before:bg-neutral-400 dark:before:bg-white",
                        ],
                        content: [
                          "py-2 px-4 shadow-xl",
                          "text-black bg-white max-w-[255px]",
                        ],
                      }}
                      placement="right-end"
                      color="foreground"
                    >
                      <Image src={InfoIcon} alt="InfoIcon" />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex my-2 gap-4">
                  <Input
                    value={video.content}
                    onChange={(e) =>
                      onChangeSticker(e.target.value, index, "content")
                    }
                    classNames={{ inputWrapper: "bg-white" }}
                  />

                  <Button
                    isIconOnly
                    onClick={() => onDeleteVideo(index)}
                    variant="light"
                    className="hover:!bg-transparent"
                    size="md"
                  >
                    <Image priority={false} src={Close} alt="close" />
                  </Button>
                </div>
                <p>Название видео</p>
                <div className="flex mt-2 gap-4">
                  <Input
                    value={video.title}
                    onChange={(e) =>
                      onChangeSticker(e.target.value, index, "title")
                    }
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
            >
              + Добавить еще видео
            </Button>
          </div>
        )}
      </div>
      <div className="h-10" />
      <div>
        <p className="font-light mb-2">Превью</p>
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
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveVideoEx(data)}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
};

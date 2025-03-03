"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TAudioData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Tooltip } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { useUploadAudioEx } from "../hooks/useUploadAudioEx";
import InfoIcon from "@/assets/icons/info.svg";
import { VideoExView } from "../../view/VideoExView";
import { useFilePicker } from "use-file-picker";

const defaultValuesStub: TAudioData = {
  title: "Let’s read!",
  titleColor: "#3F28C6",
  subtitle: "Read the part of the article",
  description: "Answer the questions below",
  images: [],
  videos: [{ content: "", title: "" }],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const Audio: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveAudioEx, success } = useUploadAudioEx(lastSortIndex);
  const { data, changeData } = useExData<TAudioData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TAudioData["images"]>(
    defaultValues?.images || []
  );

  const [editorImages, setEditorImages] = useState<TAudioData["editorImages"]>(
    defaultValues?.editorImages || []
  );

  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: ".mp3",
  });

  useEffect(() => {
    changeData("images", images);
    changeData("editorImages", editorImages);
  }, [images, changeData, editorImages]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

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
      data.videos[index][key] = text;
      changeData("videos", [...data.videos]);
    },
    [data?.videos, changeData]
  );
  console.log("filesContent", filesContent);

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
          <p className="font-light mb-2">Фоновое изображение блока</p>
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
        <div className="flex justify-center">
          <Button
            onClick={() => openFilePicker()}
            variant="faded"
            size="lg"
            color="primary"
          >
            Загрузить аудиофа22йл
          </Button>
        </div>
        {data.videos?.map((video, index) => {
          return (
            <div key={index} className="w-[100%] mb-4">
              <div className="">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p>Ссылка на видео</p>
                    <Tooltip
                      content="Вставьте ссылку на видео из Youtube, Vk Видео, Vimeo, Rutube, Google Drive или TED."
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
                    variant="flat"
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
            onClick={() => saveAudioEx(data)}
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

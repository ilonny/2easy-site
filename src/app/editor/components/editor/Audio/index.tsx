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
import { useFilePicker } from "use-file-picker";
import { FileSizeValidator } from "use-file-picker/validators";
import { getImageNameFromPath } from "../mappers";
import { AudioExView } from "../../view/AudioExView";

const defaultValuesStub: TAudioData = {
  title: "Let's listen!",
  titleColor: "#3F28C6",
  subtitle: "Listen to the audio and do the tasks below",
  description: "",
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
  const [filePickerError, setFilePickerError] = useState("");
  const { isLoading, saveAudioEx, success } = useUploadAudioEx(lastSortIndex);
  const { data, changeData } = useExData<TAudioData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TAudioData["images"]>(
    defaultValues?.images || []
  );

  const { openFilePicker, filesContent, clear, plainFiles, errors } =
    useFilePicker({
      accept: [".mp3", ".wav"],
      validators: [new FileSizeValidator({ maxFileSize: 10 * 1024 * 1024 })],
    });

  useEffect(() => {
    changeData("images", images);
    if (plainFiles?.[0]?.lastModified) {
      changeData(
        "editorImages",
        plainFiles.map((file) => {
          return { file };
        })
      );
    }
  }, [images, changeData, plainFiles]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

  const audioFile = data?.editorImages?.[0]?.file || data?.editorImages?.[0];
  const audioFileName =
    audioFile?.name || getImageNameFromPath(audioFile?.path) || "";
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
      <p>Аудиофайл (не более 10 мб)</p>
      <Button
        onClick={openFilePicker}
        variant="faded"
        size="lg"
        color="primary"
        fullWidth
        className="bg-white my-2"
      >
        <p
          style={{
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {audioFileName ? audioFileName : "Загрузить аудиофайл"}
        </p>
        {!!audioFileName && (
          <Image
            onClick={(e) => {
              e.stopPropagation();
              changeData("editorImages", []);
            }}
            priority={false}
            src={Close}
            alt="close"
            style={{ flexShrink: 0 }}
          />
        )}
      </Button>
      {errors?.map((err) => {
        if (err.reason === "FILE_SIZE_TOO_LARGE") {
          return (
            <p key={err.reason} className="text-danger">
              Файл слишком большой
            </p>
          );
        }
      })}
      <div className="w-[100%] mb-4">
        <TitleExInput
          label="Название"
          value={data.audioTitle || ""}
          setValue={(val) => changeData("audioTitle", val)}
        />
      </div>
      <TitleExInput
        isTextarea
        label="Скрипт"
        value={data.audioDescription || ""}
        setValue={(val) => changeData("audioDescription", val)}
      />
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
          <AudioExView data={data} isPreview />
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

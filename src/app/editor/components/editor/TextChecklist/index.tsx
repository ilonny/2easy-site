"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TTextStickerData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Textarea } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { useUploadTextChecklistEx } from "../hooks/useUploadTextChecklistEx";
import { TextChecklistExView } from "../../view/TextChecklistExView";

const defaultValuesStub: TTextStickerData = {
  title: "Let's speak!",
  titleColor: "#3F28C6",
  subtitle: "Look at the list below",
  description: "Tick the things you would like to try and explain your choices",
  images: [],
  editorImages: [],
  stickers: ["", ""],
  stickerBgColor: "#ffffff",
  stickerTextColor: "#000000",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const TextChecklist: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveTextChecklistEx, success } = useUploadTextChecklistEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TTextStickerData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TTextStickerData["images"]>(
    defaultValues?.images || []
  );

  const [editorImages, setEditorImages] = useState<
    TTextStickerData["editorImages"]
  >(defaultValues?.editorImages || []);

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Let's speak!",
        titleColor: "#3F28C6",
        subtitle: "Look at the list below",
        description:
          "Tick the things you would like to try and explain your choices",
        images: [],
        editorImages: [],
        stickers: ["", ""],
        stickerBgColor: "#ffffff",
        stickerTextColor: "#000000",
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
    changeData("editorImages", editorImages);
  }, [images, changeData, editorImages]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const onDeleteSticker = useCallback(
    (index: number) => {
      const stickers = data.stickers.filter((_s, i) => i !== index);
      changeData("stickers", stickers);
    },
    [changeData, data.stickers]
  );

  const createSticker = useCallback(() => {
    const stickers = data.stickers.concat("");
    changeData("stickers", stickers);
  }, [changeData, data.stickers]);

  const onChangeSticker = useCallback(
    (text, index) => {
      data.stickers[index] = text;
      changeData("stickers", [...data.stickers]);
    },
    [data?.stickers, changeData]
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
          <div className="h-4" />
          <ImageUpload
            images={editorImages}
            setImages={setEditorImages}
            isButton
            onlyPlaceholder
            fullWidth
            whiteBg
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
        {data.stickers?.map((sticker, index) => {
          return (
            <div key={index} className="w-[50%] mb-4 odd:pr-4">
              <div className="">
                <div className="flex justify-between items-center">
                  <p>Пункт {index + 1}</p>
                  {data.stickers.length > 1 && (
                    <Button
                      isIconOnly
                      onClick={() => onDeleteSticker(index)}
                      variant="light"
                      className="hover:!bg-transparent"
                      size="sm"
                    >
                      <Image priority={false} src={Close} alt="close" />
                    </Button>
                  )}
                </div>
                <div className="mt-2">
                  <Input
                    size="lg"
                    classNames={{
                      inputWrapper:
                        "bg-white focus-within:bg-white active:bg-white",
                    }}
                    value={sticker}
                    onChange={(e) => onChangeSticker(e.target.value, index)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4">
        {data.stickers?.length < 10 && (
          <div className="flex justify-center">
            <Button
              variant="light"
              onClick={() => createSticker()}
              color="primary"
              className="w-[300px]"
              size="lg"
            >
              + Добавить пункт
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
          <TextChecklistExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveTextChecklistEx(data)}
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

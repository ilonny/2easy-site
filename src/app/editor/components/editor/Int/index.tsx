"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TIntData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Textarea, Tooltip } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import InfoIcon from "@/assets/icons/info.svg";
import { IntExView } from "../../view/IntExView";
import { useUploadIntEx } from "../hooks/useUploadIntEx";

const defaultValuesStub: TIntData = {
  title: "Let's play!",
  titleColor: "#3F28C6",
  subtitle: "",
  description: "",
  images: [],
  iframe: "",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const IntEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveIntEx, success } = useUploadIntEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TIntData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TIntData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    if (!data?.id) {
      resetData({
        title: "Let's play!",
        titleColor: "#3F28C6",
        subtitle: "",
        description: "",
        images: [],
        iframe: "",
      });
    }
  }, [data?.id, resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const onChangeSticker = useCallback(
    (text: string) => {
      changeData("iframe", text);
    },
    [changeData]
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
      <div className="w-[100%] mb-4">
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p>Код вставки</p>
              <Tooltip
                content="Пожалуйста, используйте специальную ссылку для встраивания (embed link). Её можно найти в разделе 'Поделиться' (Share) на исходном сервисе (часто начинается с <iframe ...> или содержит /embed/). Прямая ссылка из браузера может работать некорректно или не отображаться."
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
              value={data.iframe}
              onChange={(e) => onChangeSticker(e.target.value)}
              classNames={{ inputWrapper: "bg-white" }}
            />
          </div>
        </div>
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
          <IntExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveIntEx(data)}
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

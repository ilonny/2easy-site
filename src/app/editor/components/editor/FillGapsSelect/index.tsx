"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TFillGapsSelectData } from "./types";
import { FC, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useUploadFillGapsSelectEx } from "../hooks/useUploadFillGapsSelectEx";

const defaultValuesStub: TFillGapsSelectData = {
  title: "Let’s read!",
  titleColor: "#3F28C6",
  subtitle: "Read the part of the article",
  description: "Answer the questions below",
  images: [],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const FillGapsSelect: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveFillGapsSelectEx, success } =
    useUploadFillGapsSelectEx(lastSortIndex);
  const { data, changeData } = useExData<TFillGapsSelectData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TFillGapsSelectData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

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
      <div className="h-10" />
      <div>
        <p className="font-light mb-2">Превью</p>
        <div
          style={{
            border: "1px solid #3F28C6",
            borderRadius: 4,
            background: "#fff",
          }}
        ></div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveFillGapsSelectEx(data)}
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

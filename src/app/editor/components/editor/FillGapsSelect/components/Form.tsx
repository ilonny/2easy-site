"use client";
import React from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { TitleExInput } from "../../TitleExInput";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { TFillGapsSelectData } from "../types";

type TProps = {
  data: TFillGapsSelectData;
  changeData: (k: string, v: any) => void;
  images: TFillGapsSelectData["images"];
  setImages: (imgs: TFillGapsSelectData["images"]) => void;
};

export const Form: React.FC<TProps> = ({ data, changeData, images, setImages }) => {
  return (
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
              <p className="text-small text-center max-w-[250px]" style={{ color: "#B7B7B7" }}>
                Нажмите на этот блок или перетащите сюда изображения
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Form;

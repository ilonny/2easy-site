"use client";
import { FC } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";
import GalleryIcon from "@/assets/icons/gallery.svg";
import { TFillGapsInputData } from "../types";

type Props = {
  images: TFillGapsInputData["images"];
  setImages: (images: TFillGapsInputData["images"]) => void;
};

export const RightPanel: FC<Props> = ({ images, setImages }) => {
  return (
    <div className="w-[50%] pl-2">
      <p className="font-light mb-2">Изображение для задания</p>
      <ImageUpload
        images={images}
        setImages={setImages}
        customPlaceHolder={
          <div className="w-full bg-white h-[200px] rounded-[10px] flex items-center justify-center flex-col gap-4">
            <Image src={GalleryIcon} alt="GalleryIcon" />
            <p className="text-small text-center max-w-[250px] text-[#B7B7B7]">
              Нажмите на этот блок или перетащите сюда изображения
            </p>
          </div>
        }
      />
    </div>
  );
};

"use client";
import { FC } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { TFillGapsDragData } from "../types";

type TProps = {
  images: TFillGapsDragData["images"];
  setImages: (images: TFillGapsDragData["images"]) => void;
};

export const ImageSection: FC<TProps> = ({ images, setImages }) => {
  return (
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
  );
};

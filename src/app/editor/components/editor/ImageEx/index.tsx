import { ImageUpload } from "@/components/ImageUpload";
import { ImageExView } from "../../view/ImageExView";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TImageExData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { useUploadImageEx } from "../hooks/useUploadImageEx";

const defaultValuesStub: TImageExData = {
  title: "let’s speak!",
  titleColor: "#3F28C6",
  subtitle: "look at the pictures",
  description: "Describe each picture and answer the questions below",
  images: [],
  viewType: "carousel",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const ImageEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveImageEx, success } = useUploadImageEx(lastSortIndex);
  const { data, changeData, resetData } = useExData<TImageExData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TImageExData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  const changeImageDescription = useCallback((text: string, index: number) => {
    setImages((i) => {
      i[index].text = text;
      return [...i];
    });
  }, []);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [success, resetData, onSuccess]);

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
          <p className="font-light mb-2">Загрузите изображения (до 12 шт)</p>
          <ImageUpload
            isMultiple
            images={images}
            setImages={setImages}
            onlyPlaceholder
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
          <div className="h-4" />
          <div>
            <RadioGroup
              value={data.viewType}
              onChange={(e) => changeData("viewType", e.target.value)}
            >
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"carousel"} />
                <p className="font-light ">карусель</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"2-col"} />
                <p className="font-light ">две колонки</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"3-col"} />
                <p className="font-light ">три колонки</p>
              </label>
            </RadioGroup>
          </div>
        </div>
      </div>
      <div className="h-5" />
      {!!images?.length && (
        <div className="flex flex-wrap">
          {images?.map((image, index) => {
            return (
              <div key={index} className="w-[25%] p-2 h-[150px] mb-12">
                <div
                  className="image-item relative w-full h-full flex items-center justify-center bg-white"
                  style={{ borderRadius: 10, overflow: "hidden" }}
                >
                  <img src={image.dataURL} style={{ height: "100%" }} />
                  <div className="image-item__btn-wrapper top-0 right-0 absolute">
                    <Button
                      isIconOnly
                      onClick={() =>
                        setImages((imgs) =>
                          imgs.filter((_img, i) => i !== index)
                        )
                      }
                      variant="light"
                      className="hover:!bg-transparent"
                    >
                      <Image priority={false} src={Close} alt="close" />
                    </Button>
                  </div>
                </div>
                <div className="h-2"></div>
                <Input
                  onChange={(e) =>
                    changeImageDescription(e.target.value, index)
                  }
                  value={images[index]?.text || ""}
                  placeholder="Подпись к изображению"
                  size="sm"
                  variant="flat"
                  style={{ zIndex: 2, position: "relative" }}
                />
              </div>
            );
          })}
        </div>
      )}
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
          <ImageExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveImageEx(data)}
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

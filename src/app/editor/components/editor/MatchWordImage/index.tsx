import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TMatchWordImageData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import { useUploadMatchWordImage } from "../hooks/useUploadMatchWordImage";
import { MatchWordImageExView } from "../../view/MatchWordImageExView";

const defaultValuesStub: TMatchWordImageData = {
  title: "Warm up",
  titleColor: "#3F28C6",
  subtitle: "Look at the pictures below",
  description: "Match the pictures with their definitions",
  images: [],
  viewType: "drag",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const MatchWordImage: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveMatchWordImageEx, success } = useUploadMatchWordImage(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TMatchWordImageData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TMatchWordImageData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Warm up",
        titleColor: "#3F28C6",
        subtitle: "Look at the pictures below",
        description: "Match the pictures with their definitions",
        images: [],
        viewType: "drag",
      });
  }, [resetData]);

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
                <Radio color="primary" value={"drag"} />
                <p className="font-light ">перенести слово к картинке</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"input"} />
                <p className="font-light ">вписать слово</p>
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
              <div key={index} className="w-[25%] p-2">
                <div className="image-item relative w-full h-full flex items-center justify-center">
                  <img src={image.dataURL} style={{ width: "100%" }} />
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
                <Input
                  onChange={(e) =>
                    changeImageDescription(e.target.value, index)
                  }
                  value={images[index]?.text || ""}
                  placeholder="Введите правильный ответ"
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
          <MatchWordImageExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveMatchWordImageEx(data)}
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

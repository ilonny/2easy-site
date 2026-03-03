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
import SortIcon from "@/assets/icons/sort.svg";
import { useUploadImageEx } from "../hooks/useUploadImageEx";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

const DragHandle = sortableHandle(() => (
  <span
    style={{ display: "flex", cursor: "grab", padding: 4 }}
    title="Перетащите для изменения порядка"
  >
    <Image
      src={SortIcon}
      alt="sort"
      style={{ width: 20, height: 20, opacity: 0.7 }}
    />
  </span>
));

const SortableImageItem = sortableElement(
  ({
    image,
    index,
    itemIndex,
    onRemove,
    onChangeDescription,
    value,
  }: {
    image: Record<string, string>;
    index: number;
    itemIndex: number;
    onRemove: (index: number) => void;
    onChangeDescription: (text: string, index: number) => void;
    value: string;
  }) => {
    const idx = itemIndex ?? index;
    return (
      <div className="w-[25%] p-2 h-[150px] mb-12">
        <div
          className="image-item relative w-full h-full flex items-center justify-center bg-white"
          style={{ borderRadius: 10, overflow: "hidden" }}
        >
          <div className="absolute top-0 left-0 z-10">
            <DragHandle />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.dataURL} style={{ height: "100%" }} alt="" />
          <div className="image-item__btn-wrapper top-0 right-0 absolute">
            <Button
              isIconOnly
              onClick={() => onRemove(idx)}
              variant="light"
              className="hover:!bg-transparent"
            >
              <Image priority={false} src={Close} alt="close" />
            </Button>
          </div>
        </div>
        <div className="h-2" />
        <Input
          onChange={(e) => onChangeDescription(e.target.value, idx)}
          value={value}
          placeholder="Подпись к изображению"
          size="sm"
          variant="flat"
          style={{ zIndex: 2, position: "relative" }}
        />
      </div>
    );
  }
);

const SortableImagesList = sortableContainer(
  ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-wrap">{children}</div>
  )
);

const defaultValuesStub: TImageExData = {
  title: "let's speak!",
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
  currentSortIndexToShift?: number;
};

export const ImageEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveImageEx, success } = useUploadImageEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TImageExData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TImageExData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    if (defaultValues?.images) {
      setImages(defaultValues.images);
    }
  }, [defaultValues?.id]);

  useEffect(() => {
    !(data as { id?: number })?.id &&
      resetData({
        title: "let's speak!",
        titleColor: "#3F28C6",
        subtitle: "look at the pictures",
        description: "Describe each picture and answer the questions below",
        images: [],
        viewType: "carousel",
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  const changeImageDescription = useCallback((text: string, index: number) => {
    setImages((i) => {
      const next = [...i];
      next[index] = { ...next[index], text };
      return next;
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((imgs) => {
      const filteredImages = imgs.filter((_, i) => {
        console.log('i, index', i, index)
        return i !== index
      })
      console.log('filteredImages', filteredImages)
      return filteredImages
    });
  }, []);

  const handleSortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      if (oldIndex !== newIndex) {
        setImages((imgs) => arrayMoveImmutable(imgs, oldIndex, newIndex));
      }
    },
    []
  );

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [success, resetData, onSuccess]);
  console.log('images', images)
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
            key={`img-upload-${images.length}`}
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
        <SortableImagesList
          axis="xy"
          useDragHandle
          helperClass="image-ex-sortable-helper"
          onSortEnd={handleSortEnd}
        >
          {images.map((image, index) => (
            <SortableImageItem
              key={image.path || image.id || image.dataURL || index}
              index={index}
              itemIndex={index}
              image={image}
              onRemove={handleRemoveImage}
              onChangeDescription={changeImageDescription}
              value={image?.text || ""}
            />
          ))}
        </SortableImagesList>
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

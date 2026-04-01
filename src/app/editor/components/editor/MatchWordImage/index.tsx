import { useTranslation } from "react-i18next";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TMatchWordImageData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import Close from "@/assets/icons/close.svg";
import DragHandleIcon from "@/assets/icons/drag_handle.svg";
import { useUploadMatchWordImage } from "../hooks/useUploadMatchWordImage";
import { MatchWordImageExView } from "../../view/MatchWordImageExView";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

const DragHandle = sortableHandle(() => {
  const { t } = useTranslation();
  return (
  <span
    style={{
      display: "flex",
      cursor: "grab",
      padding: 6,
      background: "#f4f4f5",
      borderRadius: 8,
    }}
    title={t("editor.dragToReorder")}
  >
    <Image
      src={DragHandleIcon}
      alt={t("editor.dragHint")}
      style={{ width: 20, height: 20 }}
    />
  </span>
  );
});

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
    const { t } = useTranslation();
    const idx = itemIndex ?? index;
    return (
      <div className="w-[25%] p-2 mb-4">
        <div className="image-item relative w-full h-full flex items-center justify-center">
          <div className="absolute top-0 left-0 z-10">
            <DragHandle />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.dataURL} style={{ width: "100%" }} alt="" />
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
        <Input
          onChange={(e) => onChangeDescription(e.target.value, idx)}
          value={value}
          placeholder={t("editor.enterCorrectAnswer")}
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
  const { t } = useTranslation();
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
    if (defaultValues?.images) {
      setImages(defaultValues.images);
    }
  }, [defaultValues?.id]);

  useEffect(() => {
    !(data as { id?: number })?.id &&
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
      const next = [...i];
      next[index] = { ...next[index], text };
      return next;
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((imgs) => imgs.filter((_, i) => i !== index));
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

  return (
    <div>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-0">
        <div className="w-full md:w-1/2 md:pr-2 min-w-0">
          <TitleExInput
            label={t("editor.taskTitle")}
            value={data.title}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={data.titleColor}
          />
          <div className="h-4" />
          <TitleExInput
            label={t("editor.taskSubtitle")}
            value={data.subtitle}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label={t("editor.description")}
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 min-w-0">
          <p className="font-light mb-2">{t("editor.uploadImagesUpTo12")}</p>
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
                <Radio color="primary" value={"drag"} />
                <p className="font-light ">{t("editor.matchWordToImage")}</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"input"} />
                <p className="font-light ">{t("editor.typeWord")}</p>
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
        <p className="font-light mb-2">{t("editor.preview")}</p>
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
            className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
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

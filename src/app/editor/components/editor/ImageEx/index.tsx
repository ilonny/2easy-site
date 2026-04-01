import { useTranslation } from "react-i18next";
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
import DragHandleIcon from "@/assets/icons/drag_handle.svg";
import { useUploadImageEx } from "../hooks/useUploadImageEx";
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
    placeholder,
  }: {
    image: Record<string, string>;
    index: number;
    itemIndex: number;
    onRemove: (index: number) => void;
    onChangeDescription: (text: string, index: number) => void;
    value: string;
    placeholder: string;
  }) => {
    const idx = itemIndex ?? index;
    return (
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2 mb-6 min-w-0">
        <div
          className="image-item relative w-full flex flex-col bg-white rounded-[10px] border border-default-200 overflow-hidden shadow-sm"
        >
          <div className="relative w-full aspect-[4/3] max-h-[220px] flex items-center justify-center bg-neutral-100">
            <div className="absolute top-1 left-1 z-10">
              <DragHandle />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataURL}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              alt=""
            />
            <div className="image-item__btn-wrapper top-1 right-1 absolute z-10">
              <Button
                isIconOnly
                size="sm"
                onClick={() => onRemove(idx)}
                variant="flat"
                className="hover:!bg-default-100 bg-white/90"
              >
                <Image priority={false} src={Close} alt="close" width={18} height={18} />
              </Button>
            </div>
          </div>
          <div className="p-2 w-full min-w-0">
            <Input
              onChange={(e) => onChangeDescription(e.target.value, idx)}
              value={value}
              placeholder={placeholder}
              size="sm"
              variant="flat"
              className="w-full min-w-0"
              classNames={{ inputWrapper: "w-full min-w-0" }}
            />
          </div>
        </div>
      </div>
    );
  }
);

const SortableImagesList = sortableContainer(
  ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-wrap gap-y-2 -mx-2 w-full min-w-0">{children}</div>
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
  const { t } = useTranslation();
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
    <div className="w-full min-w-0 max-w-full">
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
                  background: "#fff",
                  minHeight: 160,
                  borderRadius: 10,
                }}
                className="w-full flex items-center justify-center flex-col gap-3 sm:gap-4 px-4 py-5 border border-default-200 shadow-sm"
              >
                <Image src={GalleryIcon} alt="GalleryIcon" />
                <p
                  className="text-small text-center max-w-[250px]"
                  style={{ color: "#B7B7B7" }}
                >
                  {t("editor.clickOrDragImages")}
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
                <p className="font-light ">{t("editor.carousel")}</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"2-col"} />
                <p className="font-light ">{t("editor.twoColumns")}</p>
              </label>
              <label className="flex gap-2 items-center">
                <Radio color="primary" value={"3-col"} />
                <p className="font-light ">{t("editor.threeColumns")}</p>
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
              placeholder={t("editor.imageCaption")}
            />
          ))}
        </SortableImagesList>
      )}
      <div className="h-10" />
      <div className="w-full min-w-0">
        <p className="font-light mb-2">{t("editor.preview")}</p>
        <div
          className="rounded-md border border-primary bg-white overflow-hidden overflow-x-hidden max-w-full"
          style={{ borderColor: "#3F28C6" }}
        >
          <ImageExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
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

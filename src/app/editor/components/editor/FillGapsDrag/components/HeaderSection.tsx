"use client";
import { FC } from "react";
import { TitleExInput } from "../../TitleExInput";
import { TFillGapsDragData } from "../types";

type TProps = {
  data: TFillGapsDragData;
  onTitleChange: (value: string) => void;
  onTitleColorChange: (color: string) => void;
  onSubtitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export const HeaderSection: FC<TProps> = ({
  data,
  onTitleChange,
  onTitleColorChange,
  onSubtitleChange,
  onDescriptionChange,
}) => {
  return (
    <div className="w-[50%] pr-2">
      <TitleExInput
        label="Заголовок задания"
        value={data.title}
        setValue={onTitleChange}
        onColorChange={onTitleColorChange}
        selectedColor={data.titleColor}
      />
      <div className="h-4" />
      <TitleExInput
        label="Подзаголовок задания"
        value={data.subtitle}
        setValue={onSubtitleChange}
      />
      <div className="h-4" />
      <TitleExInput
        isTextarea
        label="Описание"
        value={data.description}
        setValue={onDescriptionChange}
      />
    </div>
  );
};

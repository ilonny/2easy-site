"use client";
import { FC } from "react";
import { TitleExInput } from "../../TitleExInput";
import { TFillGapsInputData } from "../types";

/**
 * LeftPanel - левая панель редактора (50% ширины)
 * Содержит поля для редактирования заголовка, подзаголовка и описания упражнения
 */
type Props = {
  /** Основные данные упражнения */
  data: TFillGapsInputData;
  /** Функция для обновления данных */
  changeData: (key: keyof TFillGapsInputData, value: any) => void;
};

export const LeftPanel: FC<Props> = ({ data, changeData }) => {
  return (
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
  );
};

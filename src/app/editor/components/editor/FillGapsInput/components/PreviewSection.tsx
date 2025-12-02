"use client";
import { FC } from "react";
import { Button } from "@nextui-org/react";
import { FillGapsInputExView } from "../../../view/FillGapsInputExView";
import { TFillGapsSelectData } from "../../../editor/FillGapsSelect/types";
import { TFillGapsInputData } from "../types";

/**
 * PreviewSection - секция для предпросмотра и сохранения упражнения
 * Отображает как будет выглядеть упражнение и кнопку сохранения
 */
type Props = {
  /** Данные упражнения для предпросмотра */
  data: TFillGapsInputData;
  /** Функция для сохранения данных */
  onSave: (data: any) => void;
  /** Флаг, указывающий на процесс сохранения */
  isLoading: boolean;
};

export const PreviewSection: FC<Props> = ({ data, onSave, isLoading }) => {
  return (
    <div>
      <p className="font-light mb-2">Превью</p>
      <div className="border border-[#3F28C6] rounded bg-white">
        <FillGapsInputExView isPreview={true} data={data as unknown as TFillGapsSelectData} />
      </div>
      <div className="h-5" />
      <div className="flex justify-center">
        <Button
          color="primary"
          className="min-w-[310px]"
          size="lg"
          onClick={() => onSave(data)}
          isLoading={isLoading}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

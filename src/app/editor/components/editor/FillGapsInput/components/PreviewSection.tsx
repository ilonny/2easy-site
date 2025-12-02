"use client";
import { FC } from "react";
import { Button } from "@nextui-org/react";
import { FillGapsInputExView } from "../../../view/FillGapsInputExView";
import { TFillGapsSelectData } from "../../../editor/FillGapsSelect/types";
import { TFillGapsInputData } from "../types";

type Props = {
  data: TFillGapsInputData;
  onSave: (data: any) => void;
  isLoading: boolean;
};

export const PreviewSection: FC<Props> = ({ data, onSave, isLoading }) => {
  return (
    <div>
      <p className="font-light mb-2">Превью</p>
      <div
        style={{
          border: "1px solid #3F28C6",
          borderRadius: 4,
          background: "#fff",
        }}
      >
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

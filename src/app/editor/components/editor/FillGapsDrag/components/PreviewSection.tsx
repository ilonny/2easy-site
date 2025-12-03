"use client";
import { FC } from "react";
import { Button } from "@nextui-org/react";
import { FillGapsDragExView } from "../../../view/FillGapsDragExView";
import { TFillGapsDragData } from "../types";

type TProps = {
  data: TFillGapsDragData;
  onSave: (data: unknown) => Promise<void>;
  isLoading: boolean;
};

export const PreviewSection: FC<TProps> = ({ data, onSave, isLoading }) => {
  return (
    <>
      <p className="font-light mb-2">Превью</p>
      <div
        style={{
          border: "1px solid #3F28C6",
          borderRadius: 4,
          background: "#fff",
        }}
      >
        <FillGapsDragExView isPreview={true} data={data} />
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
    </>
  );
};

"use client";
import React from "react";
import { Button } from "@nextui-org/react";
import { FillGapsSelectExView } from "../../../view/FillGapsSelectExView";

type TProps = {
  data: any;
  isLoading: boolean;
  saveFillGapsSelectEx: (data: any) => void;
};

export const Preview: React.FC<TProps> = ({ data, isLoading, saveFillGapsSelectEx }) => {
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
        <FillGapsSelectExView isPreview={true} data={data} />
      </div>
      <div className="h-5" />
      <div className="flex justify-center">
        <Button
          color="primary"
          className="min-w-[310px]"
          size="lg"
          onClick={() => saveFillGapsSelectEx(data)}
          isLoading={isLoading}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default Preview;

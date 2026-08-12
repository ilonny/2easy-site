"use client";

import { Progress } from "@nextui-org/react";
import { FC, ReactNode } from "react";
import i18n from "@/i18n/config";
import { getTrainingProgressValue } from "../../utils/trainingHelpers";

type TProps = {
  index: number;
  total: number;
  isFinished?: boolean;
  trailing?: ReactNode;
};

export const TrainingProgressHeader: FC<TProps> = ({
  index,
  total,
  isFinished = false,
  trailing,
}) => (
  <div className="shrink-0">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm sm:text-base text-[#767676]">
        {index + 1} / {total}
      </span>
      {trailing}
    </div>
    <Progress
      aria-label={i18n.t("dictionary.training.progress")}
      value={getTrainingProgressValue(index, total, isFinished)}
      color="primary"
      size="sm"
      className="max-w-full"
    />
  </div>
);

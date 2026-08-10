"use client";

import { Button } from "@nextui-org/react";
import { FC, useMemo } from "react";
import { T } from "@/i18n/T";
import { DICTIONARY_TOUCH_BUTTON_CLASS } from "../../constants";

type TProps = {
  correctCount: number;
  wrongCount: number;
  onClose: () => void;
};

export const TrainingResults: FC<TProps> = ({
  correctCount,
  wrongCount,
  onClose,
}) => {
  const total = correctCount + wrongCount;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const correctShare = total > 0 ? (correctCount / total) * 100 : 0;

  const chartStyle = useMemo(
    () => ({
      background: `conic-gradient(#17c964 0 ${correctShare}%, #f31260 ${correctShare}% 100%)`,
    }),
    [correctShare]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-6 px-2 h-full">
      <div>
        <p className="text-lg sm:text-xl font-medium text-[#231F20] text-center">
          <T k="dictionary.training.yourResults" defaultText="Ваши результаты" />
        </p>
      </div>

      <div className="flex items-center gap-6 sm:gap-8">
        <div
          className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full"
          style={chartStyle}
          aria-label={`${percent}%`}
        >
          <div className="absolute inset-3 rounded-full bg-white flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-semibold text-[#231F20]">
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-success font-medium">
              <T k="dictionary.training.correct" defaultText="Правильно" />
            </span>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-success/15 px-2 text-success font-semibold">
              {correctCount}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-danger font-medium">
              <T k="dictionary.training.incorrect" defaultText="Неправильно" />
            </span>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-danger/15 px-2 text-danger font-semibold">
              {wrongCount}
            </span>
          </div>
        </div>
      </div>

      <Button
        color="primary"
        size="md"
        className={DICTIONARY_TOUCH_BUTTON_CLASS}
        onClick={onClose}
      >
        <T k="dictionary.training.close" defaultText="Закрыть" />
      </Button>
    </div>
  );
};

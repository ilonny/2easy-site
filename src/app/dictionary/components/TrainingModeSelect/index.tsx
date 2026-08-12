"use client";

import { FC } from "react";
import { T } from "@/i18n/T";
import { TrainingMode } from "../../types";
import { DICTIONARY_TRAINING_MODE_CARD_CLASS } from "../../constants";
import { TRAINING_MODES } from "../../constants/trainingModes";

type TProps = {
  onSelect: (mode: TrainingMode) => void;
};

export const TrainingModeSelect: FC<TProps> = ({ onSelect }) => (
  <div className="flex flex-col gap-3">
    <p className="text-[#767676] text-sm sm:text-base">
      <T
        k="dictionary.training.chooseMode"
        defaultText="Выберите режим тренировки"
      />
    </p>
    {TRAINING_MODES.map((mode) => (
      <button
        key={mode.key}
        type="button"
        className={DICTIONARY_TRAINING_MODE_CARD_CLASS}
        onClick={() => onSelect(mode.key)}
      >
        <p className="font-medium text-[#231F20] text-base">
          <T k={mode.titleKey} defaultText={mode.titleDefault} />
        </p>
        <p className="mt-1 text-sm text-[#767676]">
          <T k={mode.descriptionKey} defaultText={mode.descriptionDefault} />
        </p>
      </button>
    ))}
  </div>
);

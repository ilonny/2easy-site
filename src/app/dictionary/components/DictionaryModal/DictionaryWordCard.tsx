"use client";

import { Checkbox } from "@nextui-org/react";
import { FC, KeyboardEvent } from "react";
import { SpeakWordButton } from "../SpeakWordButton";
import { TDictionaryItem } from "../../types";
import { buildSpeakWordId } from "../../utils/speechIds";

type TProps = {
  item: TDictionaryItem;
  isSelected: boolean;
  isLoading: boolean;
  onToggle: (id: number) => void;
};

export const DictionaryWordCard: FC<TProps> = ({
  item,
  isSelected,
  isLoading,
  onToggle,
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isLoading) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(item.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={isLoading ? -1 : 0}
      onClick={() => {
        if (!isLoading) {
          onToggle(item.id);
        }
      }}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
        isSelected
          ? "bg-[#eeebff] border-primary/30"
          : "border-[#eee] bg-[#fafafa]"
      } ${isLoading ? "pointer-events-none" : ""}`}
    >
      <div onClick={(event) => event.stopPropagation()}>
        <SpeakWordButton
          id={buildSpeakWordId(item.id)}
          text={item.sourceWord}
          disabled={isLoading}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words text-[#231F20] text-sm">
          {item.sourceWord}
        </p>
        <p className="text-[#767676] break-words mt-0.5 text-sm">
          {item.translatedWord}
        </p>
      </div>
      <div onClick={(event) => event.stopPropagation()}>
        <Checkbox
          className="shrink-0"
          isSelected={isSelected}
          onValueChange={() => onToggle(item.id)}
          isDisabled={isLoading}
          aria-label={item.sourceWord}
        />
      </div>
    </div>
  );
};

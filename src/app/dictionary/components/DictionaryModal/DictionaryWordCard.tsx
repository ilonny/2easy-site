"use client";

import { Checkbox } from "@nextui-org/react";
import { FC, KeyboardEvent } from "react";
import i18n from "@/i18n/config";
import { SpeakWordButton } from "../SpeakWordButton";
import { TDictionaryItem } from "../../types";
import {
  DICTIONARY_WORD_CARD_BASE_CLASS,
  DICTIONARY_WORD_CARD_CONTENT_GRID_CLASS,
  DICTIONARY_WORD_CARD_LESSON_BADGE_CLASS,
  DICTIONARY_WORD_CARD_SPEAK_WRAPPER_CLASS,
  DICTIONARY_WORD_CARD_TEXT_PRIMARY_CLASS,
  DICTIONARY_WORD_CARD_TEXT_SECONDARY_CLASS,
} from "../../constants";
import { buildSpeakWordId } from "../../utils/speechIds";

type TProps = {
  item: TDictionaryItem;
  isSelected: boolean;
  isLoading: boolean;
  showLessonBadge?: boolean;
  onToggle: (id: number) => void;
};

export const DictionaryWordCard: FC<TProps> = ({
  item,
  isSelected,
  isLoading,
  showLessonBadge = false,
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
      className={`${DICTIONARY_WORD_CARD_BASE_CLASS} ${
        isSelected
          ? "bg-[#eeebff] border-primary/30"
          : "border-[#eee] bg-[#fafafa]"
      } ${isLoading ? "pointer-events-none" : ""}`}
    >
      <div className={DICTIONARY_WORD_CARD_CONTENT_GRID_CLASS}>
        <div
          className={DICTIONARY_WORD_CARD_SPEAK_WRAPPER_CLASS}
          onClick={(event) => event.stopPropagation()}
        >
          <SpeakWordButton
            id={buildSpeakWordId(item.id)}
            text={item.sourceWord}
            disabled={isLoading}
          />
        </div>
        <p className={DICTIONARY_WORD_CARD_TEXT_PRIMARY_CLASS}>
          {item.sourceWord}
        </p>
        <p className={DICTIONARY_WORD_CARD_TEXT_SECONDARY_CLASS}>
          {item.translatedWord}
        </p>
        {showLessonBadge && item.lessonName ? (
          <span
            className={DICTIONARY_WORD_CARD_LESSON_BADGE_CLASS}
            title={i18n.t("dictionary.lessonBadge", { name: item.lessonName })}
          >
            {item.lessonName}
          </span>
        ) : null}
      </div>
      <div onClick={(event) => event.stopPropagation()}>
        <Checkbox
          className="shrink-0"
          isSelected={isSelected}
          onValueChange={() => onToggle(item.id)}
          isDisabled={isLoading}
          aria-label={i18n.t("dictionary.selectWord", { word: item.sourceWord })}
        />
      </div>
    </div>
  );
};

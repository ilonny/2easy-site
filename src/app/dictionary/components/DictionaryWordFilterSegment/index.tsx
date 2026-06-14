"use client";

import { FC } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { DICTIONARY_WORD_FILTER_SEGMENT_CONTAINER_CLASS } from "../../constants";
import { getWordFilterSegmentButtonClass } from "../../utils/getWordFilterSegmentButtonClass";

type TFilterMode = "all" | "lesson";

type TProps = {
  isLessonFilterActive: boolean;
  onChange: (mode: TFilterMode) => void;
};

export const DictionaryWordFilterSegment: FC<TProps> = ({
  isLessonFilterActive,
  onChange,
}) => (
  <div
    role="group"
    aria-label={i18n.t("dictionary.wordFilter")}
    className={DICTIONARY_WORD_FILTER_SEGMENT_CONTAINER_CLASS}
  >
    <button
      type="button"
      aria-pressed={!isLessonFilterActive}
      className={getWordFilterSegmentButtonClass(!isLessonFilterActive, "left")}
      onClick={() => onChange("all")}
    >
      <T k="dictionary.allWords" defaultText="Все слова" />
    </button>
    <button
      type="button"
      aria-pressed={isLessonFilterActive}
      className={getWordFilterSegmentButtonClass(isLessonFilterActive, "right")}
      onClick={() => onChange("lesson")}
    >
      <T k="dictionary.lessonWords" defaultText="Слова урока" />
    </button>
  </div>
);

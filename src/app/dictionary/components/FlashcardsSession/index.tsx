"use client";

import { Button } from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { TDictionaryItem } from "../../types";
import { SpeakWordButton } from "../SpeakWordButton";
import { TrainingProgressHeader } from "../TrainingProgressHeader";
import {
  DICTIONARY_TOUCH_BUTTON_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_FACE_BACK_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_FACE_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_HINT_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_INNER_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_INNER_FLIPPED_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_SCENE_CLASS,
  DICTIONARY_TRAINING_FLASHCARD_TEXT_CLASS,
} from "../../constants";
import { buildSpeakWordId } from "../../utils/speechIds";

type TProps = {
  words: TDictionaryItem[];
  onClose: () => void;
};

export const FlashcardsSession: FC<TProps> = ({ words, onClose }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const current = words[index];
  const total = words.length;

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      setIsFinished(true);
      return;
    }
    setIsFlipped(false);
    setIndex((prev) => prev + 1);
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index <= 0) {
      return;
    }
    setIsFlipped(false);
    setIndex((prev) => prev - 1);
  }, [index]);

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full py-10">
        <p className="text-lg sm:text-xl font-medium text-[#231F20] text-center">
          <T
            k="dictionary.training.cardsFinished"
            defaultText="Карточки закончились"
          />
        </p>
        <Button
          color="primary"
          size="md"
          className={DICTIONARY_TOUCH_BUTTON_CLASS}
          onClick={onClose}
        >
          <T k="dictionary.training.closeCards" defaultText="Закрыть карточки" />
        </Button>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      <TrainingProgressHeader
        index={index}
        total={total}
        isFinished={isFinished}
      />

      <div className={DICTIONARY_TRAINING_FLASHCARD_SCENE_CLASS}>
        <div
          key={current.id}
          role="button"
          tabIndex={0}
          className={`${DICTIONARY_TRAINING_FLASHCARD_INNER_CLASS} ${
            isFlipped ? DICTIONARY_TRAINING_FLASHCARD_INNER_FLIPPED_CLASS : ""
          }`}
          onClick={() => setIsFlipped((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsFlipped((prev) => !prev);
            }
          }}
          aria-label={i18n.t("dictionary.training.flipCard")}
          aria-pressed={isFlipped}
        >
          <div className={DICTIONARY_TRAINING_FLASHCARD_FACE_CLASS}>
            <div
              className="absolute top-3 left-3 z-10"
              onClick={(event) => event.stopPropagation()}
            >
              <SpeakWordButton
                id={buildSpeakWordId(current.id, "training-front")}
                text={current.sourceWord}
                languageCode={current.sourceLanguageCode}
              />
            </div>
            <p className={DICTIONARY_TRAINING_FLASHCARD_TEXT_CLASS}>
              {current.sourceWord}
            </p>
            <span className={DICTIONARY_TRAINING_FLASHCARD_HINT_CLASS}>
              <T
                k="dictionary.training.tapToFlip"
                defaultText="Коснитесь карточки, чтобы перевернуть ее"
              />
            </span>
          </div>

          <div
            className={`${DICTIONARY_TRAINING_FLASHCARD_FACE_CLASS} ${DICTIONARY_TRAINING_FLASHCARD_FACE_BACK_CLASS}`}
          >
            <div
              className="absolute top-3 left-3 z-10"
              onClick={(event) => event.stopPropagation()}
            >
              <SpeakWordButton
                id={buildSpeakWordId(current.id, "training-back")}
                text={current.translatedWord}
                languageCode={current.targetLanguageCode}
              />
            </div>
            <p className={DICTIONARY_TRAINING_FLASHCARD_TEXT_CLASS}>
              {current.translatedWord}
            </p>
            <span className={DICTIONARY_TRAINING_FLASHCARD_HINT_CLASS}>
              <T
                k="dictionary.training.swipeOrNext"
                defaultText="Листайте дальше стрелками"
              />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 shrink-0 pb-1">
        <Button
          isIconOnly
          variant="flat"
          size="lg"
          className="min-w-12 h-12 touch-manipulation"
          onClick={goPrev}
          isDisabled={index === 0}
          aria-label={i18n.t("dictionary.training.prevCard")}
        >
          ←
        </Button>
        <Button
          isIconOnly
          color="primary"
          size="lg"
          className="min-w-12 h-12 touch-manipulation"
          onClick={goNext}
          aria-label={i18n.t("dictionary.training.nextCard")}
        >
          →
        </Button>
      </div>
    </div>
  );
};

"use client";

import { Button, Input } from "@nextui-org/react";
import { FC, FormEvent, useCallback, useMemo, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { TDictionaryItem, TrainingMode } from "../../types";
import { SpeakWordButton } from "../SpeakWordButton";
import { TrainingProgressHeader } from "../TrainingProgressHeader";
import { TrainingResults } from "../TrainingResults";
import {
  DICTIONARY_TOUCH_BUTTON_CLASS,
  DICTIONARY_TRAINING_OPTION_BASE_CLASS,
  DICTIONARY_TRAINING_OPTION_CORRECT_CLASS,
  DICTIONARY_TRAINING_OPTION_DEFAULT_CLASS,
  DICTIONARY_TRAINING_OPTION_WRONG_CLASS,
} from "../../constants";
import { buildSpeakWordId } from "../../utils/speechIds";
import {
  answersMatch,
  buildQuizOptions,
  shuffleArray,
} from "../../utils/trainingHelpers";

type TProps = {
  mode: Extract<TrainingMode, "quizOptions" | "quizInput">;
  words: TDictionaryItem[];
  distractorPool: TDictionaryItem[];
  onClose: () => void;
};

type TAnswerState = "idle" | "correct" | "wrong";

export const QuizSession: FC<TProps> = ({
  mode,
  words,
  distractorPool,
  onClose,
}) => {
  const orderedWords = useMemo(() => shuffleArray(words), [words]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answerState, setAnswerState] = useState<TAnswerState>("idle");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const current = orderedWords[index];
  const total = orderedWords.length;

  const options = useMemo(() => {
    if (!current || mode !== "quizOptions") {
      return [];
    }

    const pool = distractorPool.map((item) => item.translatedWord);
    return buildQuizOptions(current.translatedWord, pool, 4);
  }, [current, distractorPool, mode]);

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      setIsFinished(true);
      return;
    }

    setIndex((prev) => prev + 1);
    setAnswerState("idle");
    setSelectedOption(null);
    setInputValue("");
  }, [index, total]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!current || answerState !== "idle") {
        return;
      }

      const isCorrect = answersMatch(answer, current.translatedWord);
      setAnswerState(isCorrect ? "correct" : "wrong");
      setSelectedOption(answer);

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setWrongCount((prev) => prev + 1);
      }
    },
    [answerState, current]
  );

  const handleOptionClick = (option: string) => {
    submitAnswer(option);
  };

  const handleInputSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }
    submitAnswer(inputValue);
  };

  if (isFinished) {
    return (
      <TrainingResults
        correctCount={correctCount}
        wrongCount={wrongCount}
        onClose={onClose}
      />
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
        trailing={
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-danger/15 px-2 text-danger text-sm font-semibold">
              {wrongCount}
            </span>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-success/15 px-2 text-success text-sm font-semibold">
              {correctCount}
            </span>
          </div>
        }
      />

      <div className="relative flex min-h-[7.5rem] items-center justify-center rounded-2xl border border-[#eee] bg-white px-12 py-6 sm:min-h-[8.5rem] sm:px-14 shadow-[0_8px_30px_rgba(35,31,32,0.06)]">
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
          <SpeakWordButton
            id={buildSpeakWordId(current.id, "quiz")}
            text={current.sourceWord}
            languageCode={current.sourceLanguageCode}
          />
        </div>
        <p className="text-xl sm:text-2xl font-medium text-[#231F20] break-words text-center">
          {current.sourceWord}
        </p>
      </div>

      {mode === "quizOptions" && (
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            let optionClass = DICTIONARY_TRAINING_OPTION_DEFAULT_CLASS;

            if (answerState !== "idle") {
              const isCorrectOption = answersMatch(
                option,
                current.translatedWord
              );
              const isSelected = selectedOption === option;

              if (isCorrectOption) {
                optionClass = DICTIONARY_TRAINING_OPTION_CORRECT_CLASS;
              } else if (isSelected) {
                optionClass = DICTIONARY_TRAINING_OPTION_WRONG_CLASS;
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={answerState !== "idle"}
                className={`${DICTIONARY_TRAINING_OPTION_BASE_CLASS} ${optionClass}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {mode === "quizInput" && (
        <form className="flex flex-col gap-3" onSubmit={handleInputSubmit}>
          <Input
            value={inputValue}
            onValueChange={setInputValue}
            placeholder={i18n.t("dictionary.training.answerPlaceholder")}
            size="lg"
            isDisabled={answerState !== "idle"}
            classNames={{
              inputWrapper:
                answerState === "correct"
                  ? "border-success border-2 bg-success/30"
                  : answerState === "wrong"
                    ? "border-danger bg-danger/10"
                    : "bg-white",
              input:
                answerState === "correct"
                  ? "text-base text-success font-medium"
                  : "text-base",
            }}
          />
          {answerState === "wrong" && (
            <p className="text-sm text-[#767676]">
              <T
                k="dictionary.training.correctAnswerIs"
                values={{ answer: current.translatedWord }}
                defaultText="Правильный ответ: {{answer}}"
              />
            </p>
          )}
          {answerState === "idle" ? (
            <Button
              type="submit"
              color="primary"
              size="md"
              className={DICTIONARY_TOUCH_BUTTON_CLASS}
              isDisabled={!inputValue.trim()}
            >
              <T k="dictionary.training.checkAnswer" defaultText="Проверить" />
            </Button>
          ) : null}
        </form>
      )}

      {answerState !== "idle" && (
        <div className="mt-auto shrink-0">
          <Button
            color="primary"
            size="md"
            className={`w-full ${DICTIONARY_TOUCH_BUTTON_CLASS}`}
            onClick={goNext}
          >
            {index >= total - 1 ? (
              <T k="dictionary.training.showResults" defaultText="К результатам" />
            ) : (
              <T k="dictionary.training.nextQuestion" defaultText="Далее" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

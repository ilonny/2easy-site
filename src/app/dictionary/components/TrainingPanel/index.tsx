"use client";

import { Button, Spinner } from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { T } from "@/i18n/T";
import {
  TDictionaryItem,
  TrainingMode,
  TrainingStep,
} from "../../types";
import { TrainingModeSelect } from "../TrainingModeSelect";
import { TrainingWordPicker } from "../TrainingWordPicker";
import { TrainingSessionModal } from "../TrainingSessionModal";
import {
  DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";
import { getTrainingMode } from "../../constants/trainingModes";

type TProps = {
  items: TDictionaryItem[];
  isLoading: boolean;
};

export const TrainingPanel: FC<TProps> = ({ items, isLoading }) => {
  const [step, setStep] = useState<TrainingStep>("modes");
  const [mode, setMode] = useState<TrainingMode | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionWords, setSessionWords] = useState<TDictionaryItem[]>([]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => items.some((item) => item.id === id))
    );
  }, [items]);

  const handleSelectMode = useCallback((nextMode: TrainingMode) => {
    setMode(nextMode);
    setSelectedIds([]);
    setStep("words");
  }, []);

  const handleBackToModes = useCallback(() => {
    setStep("modes");
    setMode(null);
    setSelectedIds([]);
  }, []);

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected =
        items.length > 0 && items.every((item) => prev.includes(item.id));
      return allSelected ? [] : items.map((item) => item.id);
    });
  }, [items]);

  const toggleGroup = useCallback((ids: number[], select: boolean) => {
    setSelectedIds((prev) => {
      if (select) {
        return Array.from(new Set([...prev, ...ids]));
      }
      const remove = new Set(ids);
      return prev.filter((id) => !remove.has(id));
    });
  }, []);

  const handleStart = useCallback(() => {
    if (!mode || !selectedIds.length) {
      return;
    }

    const selectedSet = new Set(selectedIds);
    const words = items.filter((item) => selectedSet.has(item.id));
    if (!words.length) {
      return;
    }

    setSessionWords(words);
    setSessionOpen(true);
  }, [items, mode, selectedIds]);

  const handleSessionClose = useCallback(() => {
    setSessionOpen(false);
    setSessionWords([]);
  }, []);

  const modeMeta = mode ? getTrainingMode(mode) : null;

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {step === "modes" && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-2">
            <TrainingModeSelect onSelect={handleSelectMode} />
          </div>
        )}

        {step === "words" && (
          <>
            <div className="flex items-center justify-between gap-2 shrink-0 mb-3">
              <button
                type="button"
                onClick={handleBackToModes}
                className="text-sm text-[#767676] hover:text-primary hover:underline touch-manipulation"
              >
                ← <T k="dictionary.training.backToModes" defaultText="К режимам" />
              </button>
              {modeMeta ? (
                <p className="text-sm sm:text-base text-[#767676] text-right">
                  <T k={modeMeta.titleKey} defaultText={modeMeta.titleDefault} />
                </p>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner color="primary" />
              </div>
            ) : (
              <TrainingWordPicker
                items={items}
                selectedIds={selectedIds}
                isLoading={isLoading}
                onToggle={toggleItem}
                onToggleAll={toggleAll}
                onToggleGroup={toggleGroup}
              />
            )}

            <div className={`${DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS} shrink-0 pt-3`}>
              <Button
                variant="light"
                size="md"
                className={DICTIONARY_TOUCH_BUTTON_CLASS}
                onClick={() => setSelectedIds([])}
                isDisabled={!selectedIds.length}
              >
                <T k="dictionary.resetSelection" defaultText="Сбросить" />
              </Button>
              <Button
                color="primary"
                size="md"
                className={DICTIONARY_TOUCH_BUTTON_CLASS}
                onClick={handleStart}
                isDisabled={!selectedIds.length || !mode}
              >
                <T
                  k="dictionary.training.start"
                  defaultText="Начать тренировку"
                />
              </Button>
            </div>
          </>
        )}
      </div>

      <TrainingSessionModal
        isOpen={sessionOpen}
        mode={mode}
        words={sessionWords}
        distractorPool={items}
        onClose={handleSessionClose}
      />
    </>
  );
};

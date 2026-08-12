"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC } from "react";
import { T } from "@/i18n/T";
import { TDictionaryItem, TrainingMode } from "../../types";
import {
  DICTIONARY_MODAL_CONTENT_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_TRAINING_SESSION_CLASS_NAMES,
} from "../../constants";
import { getTrainingMode } from "../../constants/trainingModes";
import { FlashcardsSession } from "../FlashcardsSession";
import { QuizSession } from "../QuizSession";

type TProps = {
  isOpen: boolean;
  mode: TrainingMode | null;
  words: TDictionaryItem[];
  distractorPool: TDictionaryItem[];
  onClose: () => void;
};

export const TrainingSessionModal: FC<TProps> = ({
  isOpen,
  mode,
  words,
  distractorPool,
  onClose,
}) => {
  if (!mode) {
    return null;
  }

  const modeMeta = getTrainingMode(mode);

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      placement="center"
      classNames={DICTIONARY_TRAINING_SESSION_CLASS_NAMES}
    >
      <ModalContent className={DICTIONARY_MODAL_CONTENT_CLASS}>
        <ModalHeader
          className={`shrink-0 ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-2`}
        >
          <T k={modeMeta.titleKey} defaultText={modeMeta.titleDefault} />
        </ModalHeader>
        <ModalBody
          className={`px-0 flex flex-col flex-1 min-h-0 overflow-hidden ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-4`}
        >
          {mode === "cards" ? (
            <FlashcardsSession words={words} onClose={onClose} />
          ) : (
            <QuizSession
              mode={mode}
              words={words}
              distractorPool={distractorPool}
              onClose={onClose}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

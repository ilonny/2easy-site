"use client";

import { FC, useCallback, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { T } from "@/i18n/T";
import { useDictionary, createWordsForLesson } from "../../hooks/useDictionary";
import { useLanguages } from "../../hooks/useLanguages";
import { useAddWordLanguagePair } from "../../hooks/useAddWordLanguagePair";
import { useAutoTranslate } from "../../hooks/useAutoTranslate";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import {
  ADD_WORD_SPEAK_ID,
  DICTIONARY_ADD_WORD_MODAL_CLASS_NAMES,
  DICTIONARY_ADD_WORD_MODAL_FOOTER_CLASS,
  DICTIONARY_EXPANDABLE_TEXTAREA_CLASS_NAMES,
  DICTIONARY_READONLY_TEXTAREA_CLASS_NAMES,
  DICTIONARY_SECONDARY_MODAL_CONTENT_CLASS,
  DICTIONARY_SECONDARY_MODAL_SCROLL_BODY_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_READONLY_SOURCE_WORD_MAX_ROWS,
  DICTIONARY_TEXTAREA_ICON_ALIGN_CLASS,
  DICTIONARY_TEXTAREA_MAX_ROWS,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";
import { SpeakWordButton } from "../SpeakWordButton";
import { LanguageSelect } from "../LanguageSelect";
import { SwapLanguagesButton } from "../SwapLanguagesButton";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  studentId?: number;
  bulkLessonId?: number;
  bulkLessonStudentIds?: number[];
  sourceWord: string;
  lessonId?: number;
  onSuccess?: () => void;
};

export const AddWordModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  studentId,
  bulkLessonId,
  bulkLessonStudentIds,
  sourceWord,
  lessonId,
  onSuccess,
}) => {
  const { translateWord, createWord } = useDictionary(studentId ?? 0);
  const { languages, getLanguages, isLoading: isLanguagesLoading } =
    useLanguages();
  const [isSaving, setIsSaving] = useState(false);

  const {
    sourceLanguageCode,
    targetLanguageCode,
    setSourceLanguageCode,
    setTargetLanguageCode,
    swapLanguages,
    persistLanguagePair,
  } = useAddWordLanguagePair({
    isVisible,
    languages,
    loadLanguages: getLanguages,
  });

  const { translatedWord, setTranslatedWord, isTranslating } = useAutoTranslate({
    isVisible,
    sourceWord,
    sourceLanguageCode,
    targetLanguageCode,
    translateWord,
  });

  const finishSuccess = useCallback(() => {
    toast(i18n.t("dictionary.wordAdded"), { type: "success" });
    onSuccess?.();
    setIsVisible(false);
  }, [onSuccess, setIsVisible]);

  const onSave = useCallback(async () => {
    if (!translatedWord.trim()) {
      toast(i18n.t("dictionary.translationRequired"), { type: "error" });
      return;
    }

    if (!sourceLanguageCode || !targetLanguageCode) {
      toast(i18n.t("dictionary.languageRequired"), { type: "error" });
      return;
    }

    if (sourceLanguageCode === targetLanguageCode) {
      toast(i18n.t("dictionary.languagesMustDiffer"), { type: "error" });
      return;
    }

    setIsSaving(true);
    persistLanguagePair();

    const payload = {
      sourceWord: sourceWord.trim(),
      translatedWord: translatedWord.trim(),
      sourceLanguageCode,
      targetLanguageCode,
    };

    try {
      if (bulkLessonId) {
        const result = await createWordsForLesson(
          bulkLessonId,
          payload,
          bulkLessonStudentIds
        );

        if (result) {
          finishSuccess();
        }

        return;
      }

      if (!studentId) {
        return;
      }

      const created = await createWord({
        ...payload,
        lessonId,
      });

      if (created) {
        finishSuccess();
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    bulkLessonId,
    bulkLessonStudentIds,
    createWord,
    finishSuccess,
    lessonId,
    persistLanguagePair,
    sourceLanguageCode,
    sourceWord,
    studentId,
    targetLanguageCode,
    translatedWord,
  ]);

  return (
    <Modal
      size="md"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="inside"
      placement="center"
      classNames={DICTIONARY_ADD_WORD_MODAL_CLASS_NAMES}
    >
      <ModalContent className={DICTIONARY_SECONDARY_MODAL_CONTENT_CLASS}>
        <ModalHeader className={`shrink-0 ${DICTIONARY_MODAL_SECTION_PADDING_CLASS}`}>
          <T k="dictionary.addWordTitle" defaultText="Добавить в словарь" />
        </ModalHeader>
        <ModalBody
          className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} ${DICTIONARY_SECONDARY_MODAL_SCROLL_BODY_CLASS}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-2">
            <div className="min-w-0 flex-1">
              <LanguageSelect
                label={
                  <T
                    k="dictionary.sourceLanguage"
                    defaultText="Язык слова"
                  />
                }
                languages={languages}
                selectedCode={sourceLanguageCode}
                onSelect={setSourceLanguageCode}
                isLoading={isLanguagesLoading}
              />
            </div>
            <SwapLanguagesButton
              onSwap={swapLanguages}
              isDisabled={!sourceLanguageCode && !targetLanguageCode}
            />
            <div className="min-w-0 flex-1">
              <LanguageSelect
                label={
                  <T
                    k="dictionary.targetLanguage"
                    defaultText="Язык перевода"
                  />
                }
                languages={languages}
                selectedCode={targetLanguageCode}
                onSelect={setTargetLanguageCode}
                isLoading={isLanguagesLoading}
              />
            </div>
          </div>
          <Textarea
            size="md"
            labelPlacement="outside"
            label={<T k="dictionary.sourceWord" defaultText="Исходное слово" />}
            value={sourceWord}
            isReadOnly
            minRows={1}
            maxRows={DICTIONARY_READONLY_SOURCE_WORD_MAX_ROWS}
            classNames={DICTIONARY_READONLY_TEXTAREA_CLASS_NAMES}
            startContent={
              <SpeakWordButton
                id={ADD_WORD_SPEAK_ID}
                text={sourceWord}
                languageCode={sourceLanguageCode}
              />
            }
          />
          <Textarea
            size="md"
            labelPlacement="outside"
            label={<T k="dictionary.translation" defaultText="Перевод" />}
            value={translatedWord}
            onValueChange={setTranslatedWord}
            minRows={1}
            maxRows={DICTIONARY_TEXTAREA_MAX_ROWS}
            classNames={DICTIONARY_EXPANDABLE_TEXTAREA_CLASS_NAMES}
            endContent={
              isTranslating ? (
                <div className={DICTIONARY_TEXTAREA_ICON_ALIGN_CLASS}>
                  <Spinner size="sm" />
                </div>
              ) : null
            }
          />
        </ModalBody>
        <ModalFooter className={DICTIONARY_ADD_WORD_MODAL_FOOTER_CLASS}>
          <Button
            variant="light"
            size="md"
            className={DICTIONARY_TOUCH_BUTTON_CLASS}
            onClick={() => setIsVisible(false)}
          >
            <T k="common.cancel" />
          </Button>
          <Button
            color="primary"
            size="md"
            className={DICTIONARY_TOUCH_BUTTON_CLASS}
            onClick={onSave}
            isLoading={isSaving}
            isDisabled={
              isTranslating ||
              !sourceLanguageCode ||
              !targetLanguageCode ||
              sourceLanguageCode === targetLanguageCode
            }
          >
            <T k="common.save" />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

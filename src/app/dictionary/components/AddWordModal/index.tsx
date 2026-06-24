"use client";

import { FC, useCallback, useEffect, useState } from "react";
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

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  studentId?: number;
  bulkLessonId?: number;
  sourceWord: string;
  lessonId?: number;
  onSuccess?: () => void;
};

export const AddWordModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  studentId,
  bulkLessonId,
  sourceWord,
  lessonId,
  onSuccess,
}) => {
  const { translateWord, createWord } = useDictionary(studentId ?? 0);
  const [translatedWord, setTranslatedWord] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isVisible || !sourceWord.trim()) {
      return;
    }

    let cancelled = false;

    const loadTranslation = async () => {
      setIsTranslating(true);
      setTranslatedWord("");
      const result = await translateWord(sourceWord.trim());

      if (!cancelled && result?.translatedWord) {
        setTranslatedWord(result.translatedWord);
      }

      if (!cancelled) {
        setIsTranslating(false);
      }
    };

    loadTranslation();

    return () => {
      cancelled = true;
    };
  }, [isVisible, sourceWord, translateWord]);

  const onSave = useCallback(async () => {
    if (!translatedWord.trim()) {
      toast(i18n.t("dictionary.translationRequired"), { type: "error" });
      return;
    }

    setIsSaving(true);

    if (bulkLessonId) {
      const result = await createWordsForLesson(bulkLessonId, {
        sourceWord: sourceWord.trim(),
        translatedWord: translatedWord.trim(),
      });
      setIsSaving(false);

      if (result) {
        toast(i18n.t("dictionary.wordAdded"), { type: "success" });
        onSuccess?.();
        setIsVisible(false);
      }

      return;
    }

    if (!studentId) {
      setIsSaving(false);
      return;
    }

    const created = await createWord({
      sourceWord: sourceWord.trim(),
      translatedWord: translatedWord.trim(),
      lessonId,
    });
    setIsSaving(false);

    if (created) {
      toast(i18n.t("dictionary.wordAdded"), { type: "success" });
      onSuccess?.();
      setIsVisible(false);
    }
  }, [
    bulkLessonId,
    createWord,
    lessonId,
    onSuccess,
    setIsVisible,
    sourceWord,
    studentId,
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
              <SpeakWordButton id={ADD_WORD_SPEAK_ID} text={sourceWord} />
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
            isDisabled={isTranslating}
          >
            <T k="common.save" />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

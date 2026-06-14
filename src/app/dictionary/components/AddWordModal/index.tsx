"use client";

import { FC, useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { T } from "@/i18n/T";
import { useDictionary } from "../../hooks/useDictionary";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import {
  ADD_WORD_SPEAK_ID,
  DICTIONARY_ADD_WORD_MODAL_CLASS_NAMES,
  DICTIONARY_ADD_WORD_MODAL_FOOTER_CLASS,
  DICTIONARY_INPUT_CLASS_NAMES,
  DICTIONARY_READONLY_INPUT_CLASS_NAMES,
  DICTIONARY_SECONDARY_MODAL_CONTENT_CLASS,
  DICTIONARY_SECONDARY_MODAL_SCROLL_BODY_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";
import { SpeakWordButton } from "../SpeakWordButton";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  studentId: number;
  sourceWord: string;
  lessonId?: number;
  onSuccess?: () => void;
};

export const AddWordModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  studentId,
  sourceWord,
  lessonId,
  onSuccess,
}) => {
  const { translateWord, createWord } = useDictionary(studentId);
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
    createWord,
    lessonId,
    onSuccess,
    setIsVisible,
    sourceWord,
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
          <Input
            size="md"
            labelPlacement="outside"
            label={<T k="dictionary.sourceWord" defaultText="Исходное слово" />}
            value={sourceWord}
            isReadOnly
            classNames={DICTIONARY_READONLY_INPUT_CLASS_NAMES}
            startContent={
              <SpeakWordButton id={ADD_WORD_SPEAK_ID} text={sourceWord} />
            }
          />
          <Input
            size="md"
            labelPlacement="outside"
            label={<T k="dictionary.translation" defaultText="Перевод" />}
            value={translatedWord}
            onValueChange={setTranslatedWord}
            classNames={DICTIONARY_INPUT_CLASS_NAMES}
            endContent={isTranslating ? <Spinner size="sm" /> : null}
          />
        </ModalBody>
        <ModalFooter className={DICTIONARY_ADD_WORD_MODAL_FOOTER_CLASS}>
          <Button
            variant="light"
            size="sm"
            className={DICTIONARY_TOUCH_BUTTON_CLASS}
            onClick={() => setIsVisible(false)}
          >
            <T k="common.cancel" />
          </Button>
          <Button
            color="primary"
            size="sm"
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

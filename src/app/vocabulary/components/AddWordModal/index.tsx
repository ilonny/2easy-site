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
import { useVocabulary } from "../../hooks/useVocabulary";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  studentId: number;
  sourceWord: string;
  lessonId?: number;
  onSuccess?: () => void;
};

const fieldLabelClassName =
  "block subpixel-antialiased pointer-events-none origin-top-left text-sm text-[#767676]";

const inputClassNames = {
  base: "w-full min-w-0",
  inputWrapper: "bg-white hove min-w-0",
  input: "text-sm",
  label: fieldLabelClassName,
};

export const AddWordModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  studentId,
  sourceWord,
  lessonId,
  onSuccess,
}) => {
  const { translateWord, createWord } = useVocabulary(studentId);
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
      toast(i18n.t("vocabulary.translationRequired"), { type: "error" });
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
      toast(i18n.t("vocabulary.wordAdded"), { type: "success" });
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
    >
      <ModalContent>
        <ModalHeader className="shrink-0">
          <T k="vocabulary.addWordTitle" defaultText="Добавить в словарь" />
        </ModalHeader>
        <ModalBody className="gap-4 text-sm">
          <div className="flex h-14 w-full flex-col justify-end px-3 py-2">
            <label className={`${fieldLabelClassName} scale-[0.85]`}>
              <T k="vocabulary.sourceWord" defaultText="Исходное слово" />
            </label>
            <p className="text-sm font-normal break-words text-[#231F20]">
              {sourceWord}
            </p>
          </div>
          <Input
            size="md"
            label={<T k="vocabulary.translation" defaultText="Перевод" />}
            value={translatedWord}
            onValueChange={setTranslatedWord}
            classNames={inputClassNames}
            endContent={isTranslating ? <Spinner size="sm" /> : null}
          />
        </ModalBody>
        <ModalFooter className="gap-2 text-sm shrink-0">
          <Button variant="light" size="sm" onClick={() => setIsVisible(false)}>
            <T k="common.cancel" />
          </Button>
          <Button
            color="primary"
            size="sm"
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

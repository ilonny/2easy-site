"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { DictionaryModal } from "../DictionaryModal";
import { AddWordModal } from "../AddWordModal";

export type LessonDictionaryHandle = {
  openDictionary: (studentId: number) => void;
  openAddWord: (word: string, studentId?: number) => void;
};

type TProps = {
  lessonId?: number;
  defaultAddWordStudentId?: number;
};

export const LessonDictionaryLayer = forwardRef<LessonDictionaryHandle, TProps>(
  ({ lessonId, defaultAddWordStudentId }, ref) => {
    const [dictionaryModalOpen, setDictionaryModalOpen] = useState(false);
    const [dictionaryStudentId, setDictionaryStudentId] = useState(0);
    const [addWordModalOpen, setAddWordModalOpen] = useState(false);
    const [addWordTargetStudentId, setAddWordTargetStudentId] = useState(0);
    const [selectedWord, setSelectedWord] = useState("");

    const openDictionary = useCallback((studentId: number) => {
      setDictionaryStudentId(studentId);
      setDictionaryModalOpen(true);
    }, []);

    const openAddWord = useCallback(
      (word: string, studentId?: number) => {
        const targetStudentId = studentId ?? defaultAddWordStudentId ?? 0;

        if (!targetStudentId) {
          return;
        }

        setAddWordTargetStudentId(targetStudentId);
        setSelectedWord(word);
        setAddWordModalOpen(true);
      },
      [defaultAddWordStudentId]
    );

    const closeAddWordModal = useCallback((isVisible: boolean) => {
      setAddWordModalOpen(isVisible);

      if (!isVisible) {
        setAddWordTargetStudentId(0);
        setSelectedWord("");
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openDictionary,
        openAddWord,
      }),
      [openAddWord, openDictionary]
    );

    return (
      <>
        {!!dictionaryStudentId && (
          <DictionaryModal
            isOpen={dictionaryModalOpen}
            onClose={() => setDictionaryModalOpen(false)}
            studentId={dictionaryStudentId}
            initialLessonId={lessonId}
          />
        )}
        {!!addWordTargetStudentId && (
          <AddWordModal
            isVisible={addWordModalOpen}
            setIsVisible={closeAddWordModal}
            studentId={addWordTargetStudentId}
            sourceWord={selectedWord}
            lessonId={lessonId}
          />
        )}
      </>
    );
  }
);

LessonDictionaryLayer.displayName = "LessonDictionaryLayer";

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
  openAddWord: (word: string) => void;
};

type TProps = {
  lessonId?: number;
  addWordStudentId?: number;
};

export const LessonDictionaryLayer = forwardRef<LessonDictionaryHandle, TProps>(
  ({ lessonId, addWordStudentId }, ref) => {
    const [dictionaryModalOpen, setDictionaryModalOpen] = useState(false);
    const [dictionaryStudentId, setDictionaryStudentId] = useState(0);
    const [addWordModalOpen, setAddWordModalOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState("");

    const openDictionary = useCallback((studentId: number) => {
      setDictionaryStudentId(studentId);
      setDictionaryModalOpen(true);
    }, []);

    const openAddWord = useCallback((word: string) => {
      setSelectedWord(word);
      setAddWordModalOpen(true);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openDictionary,
        openAddWord,
      }),
      [openDictionary, openAddWord]
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
        {!!addWordStudentId && (
          <AddWordModal
            isVisible={addWordModalOpen}
            setIsVisible={setAddWordModalOpen}
            studentId={addWordStudentId}
            sourceWord={selectedWord}
            lessonId={lessonId}
          />
        )}
      </>
    );
  }
);

LessonDictionaryLayer.displayName = "LessonDictionaryLayer";

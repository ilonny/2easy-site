"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { VocabularyModal } from "../VocabularyModal";
import { AddWordModal } from "../AddWordModal";

export type LessonVocabularyHandle = {
  openDictionary: (studentId: number) => void;
  openAddWord: (word: string) => void;
};

type TProps = {
  lessonId?: number;
  addWordStudentId?: number;
};

export const LessonVocabularyLayer = forwardRef<LessonVocabularyHandle, TProps>(
  ({ lessonId, addWordStudentId }, ref) => {
    const [vocabularyModalOpen, setVocabularyModalOpen] = useState(false);
    const [vocabularyStudentId, setVocabularyStudentId] = useState(0);
    const [addWordModalOpen, setAddWordModalOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState("");

    const openDictionary = useCallback((studentId: number) => {
      setVocabularyStudentId(studentId);
      setVocabularyModalOpen(true);
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
        {!!vocabularyStudentId && (
          <VocabularyModal
            isOpen={vocabularyModalOpen}
            onClose={() => setVocabularyModalOpen(false)}
            studentId={vocabularyStudentId}
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

LessonVocabularyLayer.displayName = "LessonVocabularyLayer";

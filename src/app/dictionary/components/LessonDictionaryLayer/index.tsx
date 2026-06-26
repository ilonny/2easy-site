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
  openAddWordForLesson: (word: string) => void;
};

type TProps = {
  lessonId?: number;
  lessonStudentIds?: number[];
  defaultAddWordStudentId?: number;
};

export const LessonDictionaryLayer = forwardRef<LessonDictionaryHandle, TProps>(
  ({ lessonId, lessonStudentIds, defaultAddWordStudentId }, ref) => {
    const [dictionaryModalOpen, setDictionaryModalOpen] = useState(false);
    const [dictionaryStudentId, setDictionaryStudentId] = useState(0);
    const [addWordModalOpen, setAddWordModalOpen] = useState(false);
    const [addWordTargetStudentId, setAddWordTargetStudentId] = useState(0);
    const [addWordBulkLessonId, setAddWordBulkLessonId] = useState(0);
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

        setAddWordBulkLessonId(0);
        setAddWordTargetStudentId(targetStudentId);
        setSelectedWord(word);
        setAddWordModalOpen(true);
      },
      [defaultAddWordStudentId]
    );

    const openAddWordForLesson = useCallback(
      (word: string) => {
        if (!lessonId) {
          return;
        }

        setAddWordTargetStudentId(0);
        setAddWordBulkLessonId(lessonId);
        setSelectedWord(word);
        setAddWordModalOpen(true);
      },
      [lessonId]
    );

    const closeAddWordModal = useCallback((isVisible: boolean) => {
      setAddWordModalOpen(isVisible);

      if (!isVisible) {
        setAddWordTargetStudentId(0);
        setAddWordBulkLessonId(0);
        setSelectedWord("");
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        openDictionary,
        openAddWord,
        openAddWordForLesson,
      }),
      [openAddWord, openAddWordForLesson, openDictionary]
    );

    const isAddWordModalMounted = addWordTargetStudentId > 0 || addWordBulkLessonId > 0;

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
        {isAddWordModalMounted && (
          <AddWordModal
            isVisible={addWordModalOpen}
            setIsVisible={closeAddWordModal}
            studentId={addWordTargetStudentId || undefined}
            bulkLessonId={addWordBulkLessonId || undefined}
            bulkLessonStudentIds={lessonStudentIds}
            sourceWord={selectedWord}
            lessonId={lessonId}
          />
        )}
      </>
    );
  }
);

LessonDictionaryLayer.displayName = "LessonDictionaryLayer";

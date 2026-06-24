"use client";

import {
  fetchDelete,
  fetchGet,
  fetchPatch,
  fetchPostJson,
} from "@/api";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  TCreateWordPayload,
  TLessonBulkCreateWordsResult,
  TTranslateResult,
  TDictionaryItem,
  TDictionaryListParams,
} from "../types";
import { parseApiErrorMessage } from "../utils/apiError";
import { buildDictionaryQueryString } from "../utils/buildDictionaryQuery";

export const createWordsForLesson = async (
  lessonId: number,
  data: Pick<
    TCreateWordPayload,
    "sourceWord" | "translatedWord" | "sourceLanguageCode" | "targetLanguageCode"
  >
): Promise<TLessonBulkCreateWordsResult | null> => {
  if (!lessonId) {
    return null;
  }

  const res = await fetchPostJson({
    path: `/lessons/${lessonId}/dictionary/words`,
    isSecure: true,
    data,
  });

  if (!res?.ok) {
    toast(await parseApiErrorMessage(res), { type: "error" });
    return null;
  }

  return res.json() as Promise<TLessonBulkCreateWordsResult>;
};

export const useDictionary = (studentId: number) => {
  const [items, setItems] = useState<TDictionaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDictionary = useCallback(
    async (params: TDictionaryListParams = {}) => {
      if (!studentId) {
        setItems([]);
        return [];
      }

      setIsLoading(true);
      try {
        const queryString = buildDictionaryQueryString(params);
        const res = await fetchGet({
          path: `/dictionary/${studentId}${queryString ? `?${queryString}` : ""}`,
          isSecure: true,
        });

        if (!res?.ok) {
          toast(await parseApiErrorMessage(res), { type: "error" });
          setItems([]);
          return [];
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        return list;
      } finally {
        setIsLoading(false);
      }
    },
    [studentId]
  );

  const translateWord = useCallback(async (text: string) => {
    const res = await fetchPostJson({
      path: "/translate",
      isSecure: true,
      data: { text },
    });

    if (!res?.ok) {
      toast(await parseApiErrorMessage(res), { type: "error" });
      return null;
    }

    return res.json() as Promise<TTranslateResult>;
  }, []);

  const createWord = useCallback(
    async (data: TCreateWordPayload) => {
      const res = await fetchPostJson({
        path: `/dictionary/${studentId}`,
        isSecure: true,
        data,
      });

      if (!res?.ok) {
        toast(await parseApiErrorMessage(res), { type: "error" });
        return null;
      }

      return res.json() as Promise<TDictionaryItem>;
    },
    [studentId]
  );

  const updateLearned = useCallback(
    async (ids: number[], isLearned: boolean) => {
      const res = await fetchPatch({
        path: `/dictionary/${studentId}/learned`,
        isSecure: true,
        data: { ids, isLearned },
      });

      if (!res?.ok) {
        toast(await parseApiErrorMessage(res), { type: "error" });
        return false;
      }

      return true;
    },
    [studentId]
  );

  const deleteWords = useCallback(
    async (ids: number[]) => {
      const res = await fetchDelete({
        path: `/dictionary/${studentId}`,
        isSecure: true,
        data: { ids },
      });

      if (!res?.ok) {
        toast(await parseApiErrorMessage(res), { type: "error" });
        return false;
      }

      return true;
    },
    [studentId]
  );

  return {
    items,
    isLoading,
    getDictionary,
    translateWord,
    createWord,
    updateLearned,
    deleteWords,
  };
};

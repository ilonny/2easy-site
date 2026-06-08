"use client";

import {
  fetchDelete,
  fetchGet,
  fetchPatch,
  fetchPostJson,
} from "@/api";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { TVocabularyItem, TVocabularyListParams } from "../types";

const parseErrorMessage = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || "Что-то пошло не так";
  } catch {
    return "Что-то пошло не так";
  }
};

export const useVocabulary = (studentId: number) => {
  const [items, setItems] = useState<TVocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getVocabulary = useCallback(
    async (params: TVocabularyListParams = {}) => {
      if (!studentId) {
        setItems([]);
        return [];
      }

      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (params.search) {
          query.set("search", params.search);
        }
        if (typeof params.isLearned === "boolean") {
          query.set("isLearned", String(params.isLearned));
        }
        if (params.lessonId) {
          query.set("lessonId", String(params.lessonId));
        }
        if (params.sortField) {
          query.set("sortField", params.sortField);
        }
        if (params.sortOrder) {
          query.set("sortOrder", params.sortOrder);
        }

        const queryString = query.toString();
        const res = await fetchGet({
          path: `/vocabulary/${studentId}${queryString ? `?${queryString}` : ""}`,
          isSecure: true,
        });

        if (!res?.ok) {
          toast(await parseErrorMessage(res), { type: "error" });
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
      toast(await parseErrorMessage(res), { type: "error" });
      return null;
    }

    return res.json() as Promise<{
      sourceWord: string;
      translatedWord: string;
    }>;
  }, []);

  const createWord = useCallback(
    async (data: {
      sourceWord: string;
      translatedWord: string;
      sourceLanguageCode?: string;
      targetLanguageCode?: string;
      lessonId?: number;
    }) => {
      const res = await fetchPostJson({
        path: `/vocabulary/${studentId}`,
        isSecure: true,
        data,
      });

      if (!res?.ok) {
        toast(await parseErrorMessage(res), { type: "error" });
        return null;
      }

      const created = await res.json();
      return created as TVocabularyItem;
    },
    [studentId]
  );

  const updateLearned = useCallback(
    async (ids: number[], isLearned: boolean) => {
      const res = await fetchPatch({
        path: `/vocabulary/${studentId}/learned`,
        isSecure: true,
        data: { ids, isLearned },
      });

      if (!res?.ok) {
        toast(await parseErrorMessage(res), { type: "error" });
        return false;
      }

      return true;
    },
    [studentId]
  );

  const deleteWords = useCallback(
    async (ids: number[]) => {
      const res = await fetchDelete({
        path: `/vocabulary/${studentId}`,
        isSecure: true,
        data: { ids },
      });

      if (!res?.ok) {
        toast(await parseErrorMessage(res), { type: "error" });
        return false;
      }

      return true;
    },
    [studentId]
  );

  return {
    items,
    isLoading,
    getVocabulary,
    translateWord,
    createWord,
    updateLearned,
    deleteWords,
  };
};

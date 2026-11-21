"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";
import {
  TABLES_EX_TYPE,
  TTablesExerciseData,
  normalizeTablesData,
} from "../Tables/tablesModel";

export const useUploadTablesEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveTablesEx = useCallback(
    async (data: TTablesExerciseData) => {
      setIsLoading(true);
      try {
        const normalized = normalizeTablesData(data);
        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: TABLES_EX_TYPE,
            data: JSON.stringify({
              title: normalized.title,
              titleColor: normalized.titleColor,
              subtitle: normalized.subtitle,
              description: normalized.description,
              tables: normalized.tables,
            }),
            sortIndex:
              data.sortIndex === 0 ? 0 : data.sortIndex || lastSortIndex || 0,
            currentSortIndexToShift,
          },
        });
        const createdEx = await createdExRes.json();
        if (createdEx?.success) {
          setSuccess(true);
        }
        checkResponse(createdEx);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSortIndexToShift, lastSortIndex, lessonId],
  );

  return { isLoading, saveTablesEx, success };
};

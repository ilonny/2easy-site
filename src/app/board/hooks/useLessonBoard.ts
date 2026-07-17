"use client";

import { useCallback, useState } from "react";
import { fetchGet } from "@/api";
import i18n from "@/i18n/config";
import { TBoard, TLessonBoardScope } from "../types";
import { buildLessonBoardQuery } from "../utils/lessonBoardQuery";

type TLessonBoardScopeResponse = {
  anchor_lesson_id: number;
  scope: TLessonBoardScope;
  scope_student_id: number | null;
  room_key: string;
};

export const useLessonBoard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchLessonBoardScope = useCallback(
    async (lessonId: number, studentId?: number) => {
      setIsLoading(true);
      try {
        const res = await fetchGet({
          path: `/board/lesson/scope?${buildLessonBoardQuery(lessonId, studentId)}`,
          isSecure: true,
        });
        const json = await res?.json();
        if (!json?.success) {
          throw new Error(json?.message || i18n.t("boards.loadScopeError"));
        }
        return json as { success: true } & TLessonBoardScopeResponse;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchLessonBoard = useCallback(
    async (lessonId: number, studentId?: number) => {
      setIsLoading(true);
      try {
        const res = await fetchGet({
          path: `/board/lesson?${buildLessonBoardQuery(lessonId, studentId)}`,
          isSecure: true,
        });
        const json = await res?.json();
        if (!json?.success) {
          throw new Error(json?.message || i18n.t("boards.loadLessonBoardError"));
        }
        return json.board as TBoard;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    fetchLessonBoardScope,
    fetchLessonBoard,
  };
};

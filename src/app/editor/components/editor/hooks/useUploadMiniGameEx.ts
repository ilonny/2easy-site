"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";
import {
  MINI_GAME_EX_TYPE,
  TMiniGameData,
  validItems,
} from "../MiniGame/types";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";

export const useUploadMiniGameEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();

  const saveMiniGameEx = useCallback(
    async (data: TMiniGameData) => {
      setIsLoading(true);
      try {
        const imagesToUpload =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data?.images as any[]) || []).filter(filterImagesToUpload) || [];

        const savedAttachments = imagesToUpload?.length
          ? await uploadImages(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              imagesToUpload.map((i: any) => ({
                ...i,
              })),
            )
          : [];

        const persistedImages = persistExerciseAttachments(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data?.images as any[],
          savedAttachments,
        ).filter((i) => !!i?.path);

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: MINI_GAME_EX_TYPE,
            data: JSON.stringify({
              title: data.title,
              titleColor: data.titleColor,
              subtitle: data.subtitle,
              description: data.description,
              images: persistedImages,
              activeGame: data.activeGame,
              items: validItems(data.items, {
                keepEmpty: data.activeGame === "flash-cards",
              }),
              options: data.options || {},
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
    [currentSortIndexToShift, lastSortIndex, lessonId, uploadImages],
  );

  return { isLoading, saveMiniGameEx, success };
};

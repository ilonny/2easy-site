"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";
import { TUnscrambleWordsData } from "../UnscrambleWords/types";
import { useUploadImage } from "@/hooks/useUploadImage";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";

export const useUploadUnscrambleWordsEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();

  const saveUnscrambleWordsEx = useCallback(
    async (data: TUnscrambleWordsData) => {
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
            type: "UNSCRAMBLE_WORDS",
            data: JSON.stringify({
              title: data.title,
              titleColor: data.titleColor,
              subtitle: data.subtitle,
              description: data.description,
              images: persistedImages,
              sentences: data.sentences,
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

  return { isLoading, saveUnscrambleWordsEx, success };
};

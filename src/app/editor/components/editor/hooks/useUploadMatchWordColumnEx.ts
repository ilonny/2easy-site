import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";
import { TMatchWordColumnData } from "../MatchWordColumn/types";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";

export const useUploadMatchWordColumnEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveMathWordColumnEx = useCallback(
    async (data: TMatchWordColumnData) => {
      setIsLoading(true);

      const bgImagesToUpload =
        (data?.images || []).filter(filterImagesToUpload) || [];
      const savedBgAttachments = bgImagesToUpload.length
        ? await uploadImages(bgImagesToUpload.map((i) => ({ ...i })))
        : undefined;
      const exBgAttachments = persistExerciseAttachments(
        data?.images,
        savedBgAttachments,
      );

      const exData = {
        ...data,
        bgAttachments: exBgAttachments,
        columns: data.columns.map((column) => {
          return {
            ...column,
            words: column.words.filter(Boolean),
          };
        }),
      };

      try {
        delete exData.images;

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: "match-word-column",
            data: JSON.stringify(exData),
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
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [lastSortIndex, lessonId, uploadImages, currentSortIndexToShift],
  );

  return { isLoading, saveMathWordColumnEx, success };
};

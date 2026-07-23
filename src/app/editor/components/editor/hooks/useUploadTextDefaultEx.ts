import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";
import { TTextDefaultData } from "../TextDefault/types";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";

export const useUploadTextDefaultEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveTextDefaultEx = useCallback(
    async (data: TTextDefaultData) => {
      setIsLoading(true);

      const bgImagesToUpload =
        (data?.images || []).filter(filterImagesToUpload) || [];
      const editorImagesToUpload =
        (data?.editorImages || []).filter(filterImagesToUpload) || [];

      const savedBgAttachments = bgImagesToUpload.length
        ? await uploadImages(bgImagesToUpload.map((i) => ({ ...i })))
        : undefined;

      const savedEditorAttachments = editorImagesToUpload.length
        ? await uploadImages(editorImagesToUpload.map((i) => ({ ...i })))
        : undefined;

      const exBgAttachments = persistExerciseAttachments(
        data?.images,
        savedBgAttachments,
      );
      const exEditorAttachments = persistExerciseAttachments(
        data?.editorImages,
        savedEditorAttachments,
      );

      const exData = {
        ...data,
        bgAttachments: exBgAttachments,
        editorAttachments: exEditorAttachments,
      };

      try {
        delete exData.images;
        delete exData.editorImages;
        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: "text-default",
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
        setSuccess(true);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [lastSortIndex, lessonId, uploadImages, currentSortIndexToShift],
  );

  return { isLoading, saveTextDefaultEx, success };
};

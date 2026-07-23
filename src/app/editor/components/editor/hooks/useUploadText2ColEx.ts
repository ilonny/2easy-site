import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";
import { TText2ColData } from "./../Text2Col/types";
import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useCallback, useState } from "react";

export const useUploadText2ColEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveText2ColEx = useCallback(
    async (data: TText2ColData) => {
      setIsLoading(true);

      const bgImagesToUpload =
        (data?.images || []).filter(filterImagesToUpload) || [];
      const editorImagesToUpload =
        (data?.editorImages || []).filter(filterImagesToUpload) || [];
      const secondEditorImagesToUpload =
        (data?.secondEditorImages || []).filter(filterImagesToUpload) || [];

      const savedBgAttachments = bgImagesToUpload.length
        ? await uploadImages(bgImagesToUpload.map((i) => ({ ...i })))
        : undefined;
      const savedEditorAttachments = editorImagesToUpload.length
        ? await uploadImages(editorImagesToUpload.map((i) => ({ ...i })))
        : undefined;
      const savedSecondEditorAttachments = secondEditorImagesToUpload.length
        ? await uploadImages(secondEditorImagesToUpload.map((i) => ({ ...i })))
        : undefined;

      const exBgAttachments = persistExerciseAttachments(
        data?.images,
        savedBgAttachments,
      );
      const exEditorAttachments = persistExerciseAttachments(
        data?.editorImages,
        savedEditorAttachments,
      );
      const exSecondEditorAttachments = persistExerciseAttachments(
        data?.secondEditorImages,
        savedSecondEditorAttachments,
      );

      const exData = {
        ...data,
        bgAttachments: exBgAttachments,
        editorAttachments: exEditorAttachments,
        secondEditorAttachments: exSecondEditorAttachments,
      };

      try {
        delete exData.images;
        delete exData.editorImages;
        delete exData.secondEditorImages;

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: "text-2-col",
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

  return { isLoading, saveText2ColEx, success };
};

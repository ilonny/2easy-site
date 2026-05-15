import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { TAudioData } from "../Audio/types";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";

export const useUploadAudioEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveAudioEx = useCallback(
    async (data: TAudioData) => {
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
            lesson_id: params.id,
            id: data.id,
            type: "audio",
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
    [lastSortIndex, params.id, uploadImages, currentSortIndexToShift],
  );

  return { isLoading, saveAudioEx, success };
};

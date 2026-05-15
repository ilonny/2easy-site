import { checkResponse, fetchPostJson } from "@/api";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadMatchWordImage = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveMatchWordImageEx = useCallback(
    async (data: any) => {
      setIsLoading(true);

      const imagesToUpload =
        (!!data?.images?.length &&
          data?.images?.filter(filterImagesToUpload)) ||
        [];

      const savedAttachments = imagesToUpload?.length
        ? await uploadImages(imagesToUpload.map((i) => ({ ...i })))
        : undefined;

      const exAttachments = persistExerciseAttachments(
        data?.images,
        savedAttachments,
      );

      const exData = {
        ...data,
        attachments: exAttachments,
      };
      try {
        delete exData.images;
        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: params.id,
            id: data.id,
            type: "match-word-image",
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
    [currentSortIndexToShift, lastSortIndex, params.id, uploadImages],
  );

  return { isLoading, saveMatchWordImageEx, success };
};

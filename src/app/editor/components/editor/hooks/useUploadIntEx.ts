import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";
import { TIntData } from "./../Int/types";
import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadIntEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveIntEx = useCallback(
    async (data: TIntData) => {
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
      };

      try {
        delete exData.images;

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: params.id,
            id: data.id,
            type: "int",
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

  return { isLoading, saveIntEx, success };
};

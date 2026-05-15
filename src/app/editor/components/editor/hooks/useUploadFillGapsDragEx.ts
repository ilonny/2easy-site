import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";
import { TVideoData } from "./../Video/types";
import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadFillGapsDragEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveFillGapsDragEx = useCallback(
    async (data: TVideoData) => {
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
            type: "fill-gaps-drag",
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

  return { isLoading, saveFillGapsDragEx, success };
};

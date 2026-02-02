import {
  filterExBgAttachments,
  filterImagesToUpload,
} from "@/app/editor/helpers";
import { TVideoData } from "./../Video/types";
import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadFillGapsInputEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveFillGapsInputEx = useCallback(
    async (data: TVideoData) => {
      setIsLoading(true);

      const exBgAttachments: any[] =
        (!!data?.images?.length &&
          data?.images?.filter(filterExBgAttachments)) ||
        [];
      const bgImagesToUpload =
        (!!data?.images?.length &&
          data?.images?.filter(filterImagesToUpload)) ||
        [];

      const savedBgAttachments = bgImagesToUpload?.length
        ? await uploadImages(
            bgImagesToUpload?.map((i) => {
              return {
                ...i,
              };
            }),
          )
        : [];

      if (savedBgAttachments?.attachments?.length) {
        savedBgAttachments?.attachments?.forEach((att, attIndex) => {
          exBgAttachments.push({
            id: att?.id,
            path: att?.path,
            text: data?.images?.[attIndex]?.text || "",
          });
        });
      }

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
            type: "fill-gaps-input",
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

  return { isLoading, saveFillGapsInputEx, success };
};

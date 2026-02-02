import { checkResponse, fetchPostJson } from "@/api";
import {
  filterExBgAttachments,
  filterImagesToUpload,
} from "@/app/editor/helpers";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadImageEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveImageEx = useCallback(
    async (data: any) => {
      setIsLoading(true);
      console.log('data?.images???', data?.images)
      const exAttachments: any[] =
        (!!data?.images?.length &&
          data?.images?.filter(filterExBgAttachments)) ||
        [];

      const imagesToUpload =
        (!!data?.images?.length &&
          data?.images?.filter(filterImagesToUpload)) ||
        [];

      const savedAttachments = imagesToUpload?.length
        ? await uploadImages(
            imagesToUpload?.map((i) => {
              return {
                ...i,
              };
            }),
          )
        : [];

      console.log("savedAttachments", savedAttachments);

      if (savedAttachments?.attachments?.length) {
        savedAttachments?.attachments?.forEach((att, attIndex) => {
          exAttachments.push({
            id: att?.id,
            path: att?.path,
            text: data?.images?.[attIndex]?.text || "",
          });
        });
      }

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
            type: "image",
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

  return { isLoading, saveImageEx, success };
};

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

      const imagesToUpload =
        (!!data?.images?.length &&
          data?.images?.filter(filterImagesToUpload)) ||
        [];

      const savedAttachments = imagesToUpload?.length
        ? await uploadImages(
            imagesToUpload?.map((i) => ({
              ...i,
            })),
          )
        : [];

      let newUploadIndex = 0;
      const exAttachments: any[] = (data?.images || []).map((img: any) => {
        if (filterExBgAttachments(img)) {
          return {
            id: img.id,
            path: img.path,
            text: img.text || "",
          };
        }
        const saved = savedAttachments?.attachments?.[newUploadIndex];
        newUploadIndex++;
        return {
          id: saved?.id,
          path: saved?.path,
          text: img.text || "",
        };
      });

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

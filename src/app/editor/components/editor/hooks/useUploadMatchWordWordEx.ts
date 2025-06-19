import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { TMatchWordWordData } from "../MatchWordWord/types";

export const useUploadMatchWordWordEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveMathWordWordEx = useCallback(
    async (data: TMatchWordWordData) => {
      setIsLoading(true);

      const exBgAttachments: any[] =
        (!!data?.images?.length && data?.images?.filter((i) => !i.file)) || [];
      const bgImagesToUpload =
        (!!data?.images?.length && data?.images?.filter((i) => !!i.file)) || [];

      const savedBgAttachments = bgImagesToUpload?.length
        ? await uploadImages(
            bgImagesToUpload?.map((i) => {
              return {
                ...i,
              };
            })
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
            type: "match-word-word",
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
    [lastSortIndex, params.id, uploadImages, currentSortIndexToShift]
  );

  return { isLoading, saveMathWordWordEx, success };
};

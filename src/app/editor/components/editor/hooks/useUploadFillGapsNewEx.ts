"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { TFillGapsNewData } from "../FillGapsNew/types";
import { useUploadImage } from "@/hooks/useUploadImage";
import { filterImagesToUpload } from "@/app/editor/helpers";

export const useUploadFillGapsNewEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();

  const saveFillGapsNewEx = useCallback(
    async (data: TFillGapsNewData) => {
      setIsLoading(true);
      try {
        const imagesToUpload =
          // `images` is used with react-images-uploading, so items may include `{file, dataURL}`
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data?.images as any[]) || []).filter(filterImagesToUpload) || [];

        const savedAttachments = imagesToUpload?.length
          ? await uploadImages(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              imagesToUpload.map((i: any) => ({
                ...i,
              })),
            )
          : [];

        let newUploadIndex = 0;
        const persistedImages = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((data?.images as any[]) || []).map((img: any) => {
            // Keep already-persisted attachment shape
            if (!filterImagesToUpload(img)) {
              return {
                id: img?.id,
                path: img?.path || img?.dataURL,
              };
            }

            const saved = savedAttachments?.attachments?.[newUploadIndex];
            newUploadIndex++;
            return {
              id: saved?.id,
              path: saved?.path,
            };
          }) || []
        ).filter((i) => !!i?.path);

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: params.id,
            id: data.id,
            type: "FILL_GAPS_NEW",
            data: JSON.stringify({
              title: data.title,
              titleColor: data.titleColor,
              subtitle: data.subtitle,
              description: data.description,
              images: persistedImages,
              mode: data.mode,
              content: data.content,
              gaps: data.gaps,
            }),
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
      } finally {
        setIsLoading(false);
      }
    },
    [currentSortIndexToShift, lastSortIndex, params.id, uploadImages],
  );

  return { isLoading, saveFillGapsNewEx, success };
};


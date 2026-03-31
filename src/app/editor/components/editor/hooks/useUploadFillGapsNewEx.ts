import { checkResponse, fetchPostJson } from "@/api";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { TFillGapsNewData } from "../FillGapsNew/types";

export const useUploadFillGapsNewEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveFillGapsNewEx = useCallback(
    async (data: TFillGapsNewData) => {
      setIsLoading(true);
      try {
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
              images: data.images,
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
    [currentSortIndexToShift, lastSortIndex, params.id],
  );

  return { isLoading, saveFillGapsNewEx, success };
};


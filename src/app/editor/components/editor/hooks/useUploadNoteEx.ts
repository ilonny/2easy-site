import { TNoteData } from "./../Note/types";
import { fetchPostJson } from "@/api";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadNoteEx = (lastSortIndex?: number) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const saveNoteEx = useCallback(
    async (data: TNoteData) => {
      setIsLoading(true);

      const exData = {
        ...data,
      };

      try {
        const body = {
          lesson_id: params.id,
          id: data.id,
          type: "note",
          data: JSON.stringify(exData),
        };
        if (
          (data.sortIndex !== undefined && data.sortIndex !== null) ||
          lastSortIndex
        ) {
          body.sortIndex = data.sortIndex || lastSortIndex;
        }

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: body,
        });
        const createdEx = await createdExRes.json();
        if (createdEx?.success) {
          setSuccess(true);
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [lastSortIndex, params.id]
  );

  return { isLoading, saveNoteEx, success };
};

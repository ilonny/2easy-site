import { fetchGet } from "@/api";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { TBoard } from "../types";

export const useBoards = (studentId?: number) => {
  const [boards, setBoards] = useState<TBoard[]>([]);
  const [boardsIsLoading, setBoardsIsLoading] = useState(false);

  const getBoards = useCallback(async () => {
    setBoardsIsLoading(true);
    try {
      const path = studentId ? `/boards?student_id=${studentId}` : "/boards";
      const res = await fetchGet({
        path,
        isSecure: true,
      });
      const data = await res?.json();
      if (data?.success) {
        setBoards(data.boards || []);
        return data.boards || [];
      }

      toast(i18n.t("boards.loadListError"), { type: "error" });
      return [];
    } catch {
      toast(i18n.t("boards.loadListError"), { type: "error" });
      return [];
    } finally {
      setBoardsIsLoading(false);
    }
  }, [studentId]);

  return {
    boards,
    setBoards,
    boardsIsLoading,
    getBoards,
  };
};

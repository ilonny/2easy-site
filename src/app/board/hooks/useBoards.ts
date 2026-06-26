import { fetchGet } from "@/api";
import { useCallback, useState } from "react";
import { TBoard } from "../types";

export const useBoards = () => {
  const [boards, setBoards] = useState<TBoard[]>([]);
  const [boardsIsLoading, setBoardsIsLoading] = useState(false);

  const getBoards = useCallback(async () => {
    setBoardsIsLoading(true);
    try {
      const res = await fetchGet({
        path: "/boards",
        isSecure: true,
      });
      const data = await res?.json();
      if (data?.success) {
        setBoards(data.boards || []);
      }
      return data?.boards || [];
    } catch (err) {
      return [];
    } finally {
      setBoardsIsLoading(false);
    }
  }, []);

  return {
    boards,
    setBoards,
    boardsIsLoading,
    getBoards,
  };
};

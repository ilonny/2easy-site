"use client";

import { fetchGet } from "@/api";
import { useCallback, useEffect, useState } from "react";
import { TBoard } from "../types";

export const useBoard = (boardId?: number) => {
  const [board, setBoard] = useState<TBoard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadBoard = useCallback(async () => {
    if (!boardId) {
      setBoard(null);
      setLoadError(false);
      return null;
    }

    setIsLoading(true);
    setLoadError(false);

    try {
      const res = await fetchGet({
        path: `/board?id=${boardId}`,
        isSecure: true,
      });
      const json = await res?.json();
      if (!json?.success) {
        setLoadError(true);
        setBoard(null);
        return null;
      }

      setBoard(json.board);
      return json.board as TBoard;
    } catch {
      setLoadError(true);
      setBoard(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  return {
    board,
    isLoading,
    loadError,
    reloadBoard: loadBoard,
  };
};

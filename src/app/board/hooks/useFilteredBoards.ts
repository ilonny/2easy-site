import { useMemo } from "react";
import { TBoard } from "../types";

export const useFilteredBoards = (boards: TBoard[], searchString?: string) =>
  useMemo(() => {
    if (!searchString) {
      return boards;
    }

    const query = searchString.toLowerCase();
    return boards.filter((board) => {
      return (
        board.title?.toLowerCase()?.includes(query) ||
        board.description?.toLowerCase()?.includes(query) ||
        board.tags?.toLowerCase()?.includes(query)
      );
    });
  }, [boards, searchString]);

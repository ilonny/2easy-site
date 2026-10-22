"use client";

import { fetchGet } from "@/api";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { TBoard } from "../types";
import {
  catalogFetchParams,
  useCatalogWorkspace,
  withCatalogQuery,
} from "@/app/school/lib/catalogWorkspace";

export const useBoards = (studentId?: number) => {
  const workspace = useCatalogWorkspace();
  const [boards, setBoards] = useState<TBoard[]>([]);
  const [boardsIsLoading, setBoardsIsLoading] = useState(false);

  const getBoards = useCallback(async () => {
    setBoardsIsLoading(true);
    try {
      const path = studentId ? `/boards?student_id=${studentId}` : "/boards";
      const res = await fetchGet({
        path: withCatalogQuery(path, workspace),
        isSecure: true,
        ...catalogFetchParams(workspace),
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
  }, [studentId, workspace]);

  return {
    boards,
    boardsIsLoading,
    getBoards,
  };
};

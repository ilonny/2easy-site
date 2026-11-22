"use client";

import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useRef, useState } from "react";
import {
  catalogFetchParams,
  useCatalogWorkspace,
  withCatalogQuery,
} from "@/app/school/lib/catalogWorkspace";
import { TLesson } from "../types";
import { TCourse } from "@/app/course/hooks/useCourses";

export type TCatalogItemType = "folder" | "lesson" | "course";

export type TCatalogFolder = {
  id: number;
  type: "folder";
  title: string;
  description?: string;
  tags?: string;
  image_id?: string;
  image_path?: string;
  user_id: number;
  school_id?: number | null;
  sort_index?: number;
  canEdit?: boolean;
  folder_id?: null;
};

export type TCatalogLesson = TLesson & { type: "lesson"; sort_index?: number; folder_id?: number | null };
export type TCatalogCourse = TCourse & { type: "course"; sort_index?: number; folder_id?: number | null };

export type TCatalogItem = TCatalogFolder | TCatalogLesson | TCatalogCourse;

export const useCatalog = () => {
  const workspace = useCatalogWorkspace();
  const workspaceKey = `${workspace.workspaceScope || ""}:${workspace.schoolId || ""}:${workspace.teacherUserId || ""}`;
  const [items, setItems] = useState<TCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const getCatalog = useCallback(
    async (
      folderId?: number | null,
      signal?: AbortSignal,
      silent?: boolean,
    ) => {
      const requestId = ++requestIdRef.current;
      // Silent refresh (e.g. after DnD) must not flip the full-page loader.
      if (!silent) setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (folderId != null) params.set("folder_id", String(folderId));
        const base = params.toString()
          ? `/v2/catalog?${params.toString()}`
          : "/v2/catalog";
        const res = await fetchGet({
          path: withCatalogQuery(base, workspace),
          isSecure: true,
          signal,
          ...catalogFetchParams(workspace),
        });
        if (signal?.aborted || requestId !== requestIdRef.current) return;
        const data = await res?.json();
        if (signal?.aborted || requestId !== requestIdRef.current) return;
        if (data?.success === false) return data;
        if (data) setItems((data.items || []) as TCatalogItem[]);
        return data;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
        throw error;
      } finally {
        if (
          !silent &&
          !signal?.aborted &&
          requestId === requestIdRef.current
        ) {
          setIsLoading(false);
        }
      }
    },
    [workspaceKey],
  );

  const reorderCatalog = useCallback(
    async (
      folderId: number | null,
      ordered: { type: TCatalogItemType; id: number }[],
    ) => {
      const res = await fetchPostJson({
        path: "/v2/catalog/reorder",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: { folder_id: folderId, items: ordered },
      });
      const data = await res.json();
      checkResponse(data);
      return data;
    },
    [workspaceKey],
  );

  const moveToFolder = useCallback(
    async (
      type: "lesson" | "course",
      id: number,
      folderId: number | null,
    ) => {
      const res = await fetchPostJson({
        path: "/v2/catalog/move",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: { type, id, folder_id: folderId },
      });
      const data = await res.json();
      checkResponse(data);
      return data;
    },
    [workspaceKey],
  );

  const createFolder = useCallback(
    async (payload: {
      title: string;
      description?: string;
      tags?: string;
      image_id?: string | number;
    }) => {
      const res = await fetchPostJson({
        path: "/v2/folders",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: payload,
      });
      const data = await res.json();
      checkResponse(data);
      return data;
    },
    [workspaceKey],
  );

  const editFolder = useCallback(
    async (payload: {
      id: number;
      title?: string;
      description?: string;
      tags?: string;
      image_id?: string | number;
    }) => {
      const res = await fetchPostJson({
        path: "/v2/folders/edit",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: payload,
      });
      const data = await res.json();
      checkResponse(data);
      return data;
    },
    [workspaceKey],
  );

  const checkFolderContents = useCallback(
    async (id: number) => {
      const res = await fetchPostJson({
        path: "/v2/folders/delete",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: { id, check: true },
      });
      return res.json();
    },
    [workspaceKey],
  );

  const deleteFolder = useCallback(
    async (id: number, force = false) => {
      const res = await fetchPostJson({
        path: "/v2/folders/delete",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: { id, force },
      });
      const data = await res.json();
      // 409 + counts = expected "not empty" probe for the modal — no error toast.
      if (
        Number(data?.status) === 409 ||
        (!data?.success && data?.counts)
      ) {
        return data;
      }
      checkResponse(data);
      return data;
    },
    [workspaceKey],
  );

  return {
    items,
    setItems,
    isLoading,
    getCatalog,
    reorderCatalog,
    moveToFolder,
    createFolder,
    editFolder,
    deleteFolder,
    checkFolderContents,
  };
};

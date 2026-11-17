"use client";

import { useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { boardAuthHeaders } from "../api/loadBoardContent";
import {
  getStashedFile,
  stashBoardFile,
  visibleImageFileIds,
} from "../utils/boardFileStore";

const VIEW_PAD = 0.75;
const BATCH_SIZE = 8;

type TBinaryFile = Record<string, unknown> & { id: string; dataURL: string };

export type TImageLoadState = {
  loaded: number;
  total: number;
  loading: boolean;
};

const fileIdOf = (id: string, file: Record<string, unknown>) =>
  String(file.id || id);

const asBinary = (id: string, file: Record<string, unknown>): TBinaryFile | null => {
  const dataURL = file.dataURL;
  if (typeof dataURL !== "string" || !dataURL) return null;
  const resolvedId = fileIdOf(id, file);
  if (!resolvedId) return null;
  return { ...file, id: resolvedId, dataURL };
};

/**
 * Excalidraw ignores addFiles when a stub with the same id is already
 * registered, so the gray placeholder never receives the bytes.
 */
const installBinaries = (api: ExcalidrawImperativeAPI, binaries: TBinaryFile[]) => {
  if (!binaries.length) return;
  const files = api.getFiles() as Record<string, { dataURL?: string } | undefined>;
  binaries.forEach((file) => {
    const current = files[file.id];
    if (current && !current.dataURL) {
      delete files[file.id];
    }
  });
  api.addFiles(binaries as never);
};

export const useVisibleBoardFiles = (
  api: ExcalidrawImperativeAPI | null,
  boardId: number,
) => {
  const [imageProgress, setImageProgress] = useState<TImageLoadState | null>(null);
  const inflightRef = useRef(new Set<string>());
  const cooldownRef = useRef(new Map<string, number>());
  const attemptsRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!api || !boardId) return;

    let cancelled = false;
    let running = false;
    let dirty = false;

    const hasBinary = (id: string) => {
      const live = api.getFiles()[id] as { dataURL?: string } | undefined;
      if (typeof live?.dataURL === "string" && live.dataURL) return true;
      const stashed = getStashedFile(boardId, id)?.dataURL;
      return typeof stashed === "string" && !!stashed;
    };

    const publish = (ids: string[], loading: boolean) => {
      const loaded = ids.filter(hasBinary).length;
      setImageProgress((current) => {
        if (!ids.length) return current ? null : current;
        if (
          current?.loaded === loaded &&
          current.total === ids.length &&
          current.loading === loading
        ) {
          return current;
        }
        return { loaded, total: ids.length, loading };
      });
    };

    const loadVisible = async () => {
      if (running) {
        dirty = true;
        return;
      }
      const appState = api.getAppState();
      const zoom = appState.zoom?.value || 1;
      const width = (appState.width || 0) / zoom;
      const height = (appState.height || 0) / zoom;
      if (!width || !height) return;

      const pad = zoom < 0.15 ? 0.08 : VIEW_PAD;
      const view = {
        left: -appState.scrollX - width * pad,
        top: -appState.scrollY - height * pad,
        right: -appState.scrollX + width * (1 + pad),
        bottom: -appState.scrollY + height * (1 + pad),
      };
      const ids = visibleImageFileIds(api.getSceneElements(), view, zoom).map(
        (image) => image.id,
      );
      const now = Date.now();
      const missing = ids.filter((id) => {
        if (hasBinary(id)) return false;
        if (inflightRef.current.has(id)) return false;
        return (cooldownRef.current.get(id) || 0) <= now;
      });

      const cached = missing
        .map((id) => asBinary(id, getStashedFile(boardId, id) || {}))
        .filter((file): file is TBinaryFile => !!file);
      if (cached.length) installBinaries(api, cached);
      const cachedIds = new Set(cached.map((file) => file.id));
      const remoteMissing = missing.filter((id) => !cachedIds.has(id));

      if (!remoteMissing.length) {
        publish(ids, inflightRef.current.size > 0);
        return;
      }

      running = true;
      remoteMissing.forEach((id) => inflightRef.current.add(id));
      publish(ids, true);
      try {
        for (let index = 0; index < remoteMissing.length; index += BATCH_SIZE) {
          if (cancelled) return;
          const batch = remoteMissing.slice(index, index + BATCH_SIZE);
          const res = await fetch(
            `/api/board-files?id=${boardId}&file_ids=${batch.map(encodeURIComponent).join(",")}`,
            { headers: boardAuthHeaders(), cache: "no-store" },
          );
          const json = await res.json().catch(() => null);
          const files =
            json?.files && typeof json.files === "object"
              ? (json.files as Record<string, Record<string, unknown>>)
              : {};
          const binaries = Object.entries(files)
            .map(([id, file]) =>
              file && typeof file === "object" ? asBinary(id, file) : null,
            )
            .filter((file): file is TBinaryFile => !!file);

          if (cancelled) return;
          binaries.forEach((file) => stashBoardFile(boardId, file.id, file, true));
          installBinaries(api, binaries);

          const found = new Set(binaries.map((file) => file.id));
          batch.forEach((id) => {
            if (found.has(id)) {
              attemptsRef.current.delete(id);
              cooldownRef.current.delete(id);
              return;
            }
            const attempts = (attemptsRef.current.get(id) || 0) + 1;
            attemptsRef.current.set(id, attempts);
            cooldownRef.current.set(
              id,
              Date.now() + (attempts >= 3 ? 60_000 : 4_000),
            );
          });
          publish(ids, true);
        }
      } catch {
        remoteMissing.forEach((id) => cooldownRef.current.set(id, Date.now() + 4_000));
      } finally {
        remoteMissing.forEach((id) => inflightRef.current.delete(id));
        running = false;
        if (!cancelled) publish(ids, inflightRef.current.size > 0);
        if (dirty && !cancelled) {
          dirty = false;
          void loadVisible();
        }
      }
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void loadVisible();
      }, 180);
    };

    const unsubScroll = api.onScrollChange(schedule);
    const unsubChange = api.onChange(schedule);
    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubScroll();
      unsubChange();
    };
  }, [api, boardId]);

  return imageProgress;
};

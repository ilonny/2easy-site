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

export const useVisibleBoardFiles = (
  api: ExcalidrawImperativeAPI | null,
  boardId: number,
) => {
  const [imageProgress, setImageProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  const inflightRef = useRef(new Set<string>());
  const cooldownRef = useRef(new Map<string, number>());

  useEffect(() => {
    if (!api || !boardId) return;

    let cancelled = false;

    const loadVisible = async () => {
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
      const ids = visibleImageFileIds(api.getSceneElements(), view, zoom);
      const known = api.getFiles();
      const now = Date.now();
      const missing = ids.filter((id) => {
        const file = known[id] as { dataURL?: string } | undefined;
        if (file?.dataURL) return false;
        if (inflightRef.current.has(id)) return false;
        const cooldown = cooldownRef.current.get(id) || 0;
        return cooldown <= now;
      });
      const cached = missing.filter((id) => {
        const file = getStashedFile(boardId, id);
        return typeof file?.dataURL === "string" && !!file.dataURL;
      });
      if (cached.length) {
        api.addFiles(
          cached.map((id) => getStashedFile(boardId, id)).filter(Boolean) as never,
        );
      }
      const remoteMissing = missing.filter((id) => !cached.includes(id));

      const loadedCount =
        ids.filter((id) => {
          const file = known[id] as { dataURL?: string } | undefined;
          return !!file?.dataURL;
        }).length + cached.length;
      setImageProgress((current) => {
        if (!ids.length) return current ? null : current;
        if (current?.loaded === loadedCount && current.total === ids.length) {
          return current;
        }
        return { loaded: loadedCount, total: ids.length };
      });
      if (!remoteMissing.length) return;

      remoteMissing.forEach((id) => inflightRef.current.add(id));
      try {
        for (let index = 0; index < remoteMissing.length; index += 8) {
          const batch = remoteMissing.slice(index, index + 8);
          const res = await fetch(
            `/api/board-files?id=${boardId}&file_ids=${batch.join(",")}`,
            { headers: boardAuthHeaders(), cache: "no-store" },
          );
          const json = await res.json().catch(() => null);
          const files = json?.files && typeof json.files === "object" ? json.files : {};
          const binaries = Object.values(files).filter((file) => {
            return (
              !!file &&
              typeof file === "object" &&
              typeof (file as { dataURL?: unknown }).dataURL === "string"
            );
          }) as Array<Record<string, unknown> & { id?: string; dataURL?: string }>;

          if (cancelled) return;
          binaries.forEach((file) => {
            const id = String(file.id || "");
            if (!id) return;
            stashBoardFile(boardId, id, file, true);
          });
          if (binaries.length) {
            api.addFiles(binaries as never);
          }

          const found = new Set(
            binaries.map((file) => String(file.id || "")).filter(Boolean),
          );
          batch.forEach((id) => {
            if (!found.has(id)) cooldownRef.current.set(id, Date.now() + 8000);
          });
        }
      } catch {
        remoteMissing.forEach((id) => cooldownRef.current.set(id, Date.now() + 8000));
      } finally {
        remoteMissing.forEach((id) => inflightRef.current.delete(id));
        if (!cancelled) {
          const nextKnown = api.getFiles();
          const nextLoaded = ids.filter((id) => {
            const file = nextKnown[id] as { dataURL?: string } | undefined;
            return !!file?.dataURL;
          }).length;
          setImageProgress((current) => {
            if (!ids.length) return null;
            if (current?.loaded === nextLoaded && current.total === ids.length) {
              return current;
            }
            return { loaded: nextLoaded, total: ids.length };
          });
        }
      }
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void loadVisible();
      }, 120);
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

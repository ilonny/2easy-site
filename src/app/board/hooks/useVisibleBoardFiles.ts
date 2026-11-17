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
const SLOT_MIN_PX = 36;

export type TImageSlot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TImageLoadState = {
  loaded: number;
  total: number;
  slots: TImageSlot[];
};

const clientSlot = (
  image: { x: number; y: number; width: number; height: number; id: string },
  appState: {
    zoom?: { value?: number };
    scrollX?: number;
    scrollY?: number;
    offsetLeft?: number;
    offsetTop?: number;
  },
): TImageSlot => {
  const zoom = appState.zoom?.value || 1;
  return {
    id: image.id,
    x: (image.x + (appState.scrollX || 0)) * zoom + (appState.offsetLeft || 0),
    y: (image.y + (appState.scrollY || 0)) * zoom + (appState.offsetTop || 0),
    width: image.width * zoom,
    height: image.height * zoom,
  };
};

export const useVisibleBoardFiles = (
  api: ExcalidrawImperativeAPI | null,
  boardId: number,
) => {
  const [imageProgress, setImageProgress] = useState<TImageLoadState | null>(null);
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
      const visible = visibleImageFileIds(api.getSceneElements(), view, zoom);
      const ids = visible.map((image) => image.id);
      const known = api.getFiles();
      const hasBinary = (id: string) => {
        const file = known[id] as { dataURL?: string } | undefined;
        return !!file?.dataURL;
      };
      const now = Date.now();
      const missing = ids.filter((id) => {
        if (hasBinary(id)) return false;
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

      const publishProgress = (loadedCount: number) => {
        const ready = new Set(
          ids.filter((id) => {
            const file = api.getFiles()[id] as { dataURL?: string } | undefined;
            return !!file?.dataURL;
          }),
        );
        cached.forEach((id) => ready.add(id));
        const slots = visible
          .filter((image) => !ready.has(image.id))
          .map((image) => clientSlot(image, appState))
          .filter((slot) => slot.width >= SLOT_MIN_PX && slot.height >= SLOT_MIN_PX);
        setImageProgress((current) => {
          if (!ids.length) return current ? null : current;
          const sameSlots =
            current?.slots.length === slots.length &&
            current.slots.every(
              (slot, index) =>
                slot.id === slots[index]?.id &&
                Math.abs(slot.x - slots[index].x) < 1 &&
                Math.abs(slot.y - slots[index].y) < 1,
            );
          if (
            current?.loaded === loadedCount &&
            current.total === ids.length &&
            sameSlots
          ) {
            return current;
          }
          return { loaded: loadedCount, total: ids.length, slots };
        });
      };

      const loadedCount = ids.filter(hasBinary).length + cached.length;
      publishProgress(loadedCount);
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
          if (!cancelled) {
            const nextKnown = api.getFiles();
            publishProgress(
              ids.filter((id) => {
                const file = nextKnown[id] as { dataURL?: string } | undefined;
                return !!file?.dataURL;
              }).length,
            );
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
          publishProgress(
            ids.filter((id) => {
              const file = nextKnown[id] as { dataURL?: string } | undefined;
              return !!file?.dataURL;
            }).length,
          );
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

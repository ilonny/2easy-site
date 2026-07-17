"use client";

import { attachAutoFinalizeLineTool } from "@/app/board/utils/boardLineTool";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { RefObject, useEffect } from "react";

/** Two-click finish for Excalidraw line/arrow multi-point mode. */
export const useAutoFinalizeLineTool = (
  api: ExcalidrawImperativeAPI | null,
  editorWrapRef: RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const root = editorWrapRef.current;
    if (!api || !root) {
      return;
    }
    return attachAutoFinalizeLineTool(api, root);
  }, [api, editorWrapRef]);
};

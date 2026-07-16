"use client";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { RefObject, useEffect, useState } from "react";

const TOOLBAR_CONTAINER_SELECTOR = ".App-toolbar-container";
const TOOLBAR_FIND_MAX_FRAMES = 30;

/** Resolves Excalidraw's toolbar container after the editor mounts. */
export const useBoardToolbarContainer = (
  api: ExcalidrawImperativeAPI | null,
  editorWrapRef: RefObject<HTMLElement | null>,
) => {
  const [toolbarContainer, setToolbarContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (!api) {
      setToolbarContainer(null);
      return;
    }

    let frame = 0;
    let attempts = 0;

    const findContainer = () => {
      const container = editorWrapRef.current?.querySelector<HTMLElement>(
        TOOLBAR_CONTAINER_SELECTOR,
      );
      if (container) {
        setToolbarContainer(container);
        return;
      }
      if (attempts++ < TOOLBAR_FIND_MAX_FRAMES) {
        frame = requestAnimationFrame(findContainer);
      }
    };

    findContainer();
    return () => cancelAnimationFrame(frame);
  }, [api, editorWrapRef]);

  return toolbarContainer;
};

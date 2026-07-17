"use client";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export const fitBoardViewport = (api: ExcalidrawImperativeAPI) => {
  const appState = api.getAppState();
  const elements = api.getSceneElements();

  if (
    !elements.length ||
    !appState.width ||
    !appState.height ||
    appState.isLoading
  ) {
    return false;
  }

  api.scrollToContent(elements, {
    fitToViewport: true,
    viewportZoomFactor: 0.92,
    animate: false,
  });
  return true;
};

/**
 * Excalidraw may call excalidrawAPI before async initialData restore finishes.
 * Wait until the scene is ready, then fit content once.
 */
export const attachFitBoardViewportOnLoad = (
  api: ExcalidrawImperativeAPI,
  shouldFit: () => boolean,
  onFit: () => void,
) => {
  const attemptFit = () => {
    if (!shouldFit()) {
      return true;
    }

    const appState = api.getAppState();
    const isSceneReady =
      !appState.isLoading && appState.width > 0 && appState.height > 0;

    if (!isSceneReady) {
      return false;
    }

    onFit();

    if (api.getSceneElements().length > 0) {
      fitBoardViewport(api);
    }

    return true;
  };

  if (attemptFit()) {
    return () => {};
  }

  const unsubscribe = api.onChange(() => {
    if (attemptFit()) {
      unsubscribe();
    }
  });

  return unsubscribe;
};

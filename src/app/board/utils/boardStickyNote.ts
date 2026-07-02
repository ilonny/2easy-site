"use client";

import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
  ROUNDNESS,
  viewportCoordsToSceneCoords,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export const STICKY_NOTE_WIDTH = 220;
export const STICKY_NOTE_HEIGHT = 220;

const STICKY_NOTE_BACKGROUND = "#fff3bf";
const STICKY_NOTE_STROKE = "#f08c00";

const createStickyNoteSkeleton = (x: number, y: number) => ({
  type: "rectangle" as const,
  x,
  y,
  width: STICKY_NOTE_WIDTH,
  height: STICKY_NOTE_HEIGHT,
  backgroundColor: STICKY_NOTE_BACKGROUND,
  strokeColor: STICKY_NOTE_STROKE,
  fillStyle: "solid" as const,
  strokeWidth: 1,
  roundness: { type: ROUNDNESS.ADAPTIVE_RADIUS },
  label: {
    text: " ",
    fontSize: 20,
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  },
});

const getViewportCenterSceneCoords = (api: ExcalidrawImperativeAPI) => {
  const appState = api.getAppState();
  const width = appState.width || 0;
  const height = appState.height || 0;

  const center = viewportCoordsToSceneCoords(
    {
      clientX: appState.offsetLeft + width / 2,
      clientY: appState.offsetTop + height / 2,
    },
    {
      zoom: appState.zoom,
      offsetLeft: appState.offsetLeft,
      offsetTop: appState.offsetTop,
      scrollX: appState.scrollX,
      scrollY: appState.scrollY,
    },
  );

  return {
    x: center.x - STICKY_NOTE_WIDTH / 2,
    y: center.y - STICKY_NOTE_HEIGHT / 2,
  };
};

export const insertStickyNote = (api: ExcalidrawImperativeAPI) => {
  const { x, y } = getViewportCenterSceneCoords(api);
  const newElements = convertToExcalidrawElements(
    [createStickyNoteSkeleton(x, y)],
    { regenerateIds: true },
  );
  const stickyContainer = newElements.find((element) => element.type === "rectangle");

  api.updateScene({
    elements: [...api.getSceneElementsIncludingDeleted(), ...newElements],
    appState: stickyContainer
      ? {
          selectedElementIds: { [stickyContainer.id]: true },
          newElement: null,
        }
      : undefined,
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
};

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
 * Excalidraw invokes excalidrawAPI before async initialData restore finishes.
 * Wait until the scene is loaded, then fit content into the viewport once.
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
    const elements = api.getSceneElements();
    const isSceneReady =
      !appState.isLoading && appState.width > 0 && appState.height > 0;

    if (!isSceneReady) {
      return false;
    }

    onFit();

    if (elements.length > 0) {
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

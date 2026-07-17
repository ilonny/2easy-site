"use client";

import { viewportCoordsToSceneCoords } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type TScenePoint = { x: number; y: number };

const getViewportTransform = (api: ExcalidrawImperativeAPI) => {
  const appState = api.getAppState();
  return {
    zoom: appState.zoom,
    offsetLeft: appState.offsetLeft,
    offsetTop: appState.offsetTop,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
  };
};

export const clientToSceneCoords = (
  api: ExcalidrawImperativeAPI,
  clientX: number,
  clientY: number,
): TScenePoint =>
  viewportCoordsToSceneCoords(
    { clientX, clientY },
    getViewportTransform(api),
  );

export const getViewportCenterSceneCoords = (
  api: ExcalidrawImperativeAPI,
): TScenePoint & { clientX: number; clientY: number } => {
  const appState = api.getAppState();
  const clientX = appState.offsetLeft + (appState.width || 0) / 2;
  const clientY = appState.offsetTop + (appState.height || 0) / 2;
  const center = clientToSceneCoords(api, clientX, clientY);

  return { ...center, clientX, clientY };
};

"use client";

import {
  CaptureUpdateAction,
  mutateElement,
  newElementWith,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { clientToSceneCoords } from "./boardExcalidrawCoords";

type TLinearMultiElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  points: readonly (readonly [number, number])[];
};

const UI_CHROME_SELECTOR =
  ".App-toolbar, .App-toolbar-container, .App-menu, .layer-ui__wrapper__footer, .Island button, button, [role='button']";

const isLinearMultiElement = (
  value: unknown,
): value is TLinearMultiElement => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const element = value as TLinearMultiElement;
  return (
    (element.type === "line" || element.type === "arrow") &&
    Array.isArray(element.points) &&
    element.points.length > 0
  );
};

const isUiChromeTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return true;
  }
  if (target.closest(UI_CHROME_SELECTOR)) {
    return true;
  }
  return !target.closest(".excalidraw");
};

const buildTwoPointSegment = (
  multiElement: TLinearMultiElement,
  endSceneX: number,
  endSceneY: number,
): [number, number][] => {
  const start: [number, number] = [
    multiElement.points[0][0],
    multiElement.points[0][1],
  ];
  const end: [number, number] = [
    endSceneX - multiElement.x,
    endSceneY - multiElement.y,
  ];

  // Avoid a zero-length segment when the user clicks without moving.
  if (start[0] === end[0] && start[1] === end[1]) {
    end[0] += 1;
    end[1] += 1;
  }

  return [start, end];
};

const exitMultiPointMode = (
  api: ExcalidrawImperativeAPI,
  elementId: string,
  points: [number, number][],
) => {
  const multiElement = api.getAppState().multiElement;
  if (isLinearMultiElement(multiElement) && multiElement.id === elementId) {
    mutateElement(multiElement as never, {
      points,
      lastCommittedPoint: null,
    });
  }

  const nextElements = api.getSceneElementsIncludingDeleted().map((element) => {
    if (element.id !== elementId) {
      return element;
    }
    return newElementWith(element as never, {
      points,
      lastCommittedPoint: null,
    } as never);
  });

  const selectedElementIds = { [elementId]: true };

  api.updateScene({
    elements: nextElements,
    appState: {
      multiElement: null,
      newElement: null,
      selectedElementIds,
    },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });

  // Switching away from selection is Excalidraw's path that clears multi-point mode.
  api.setActiveTool({ type: "freedraw" });
  api.setActiveTool({ type: "selection" });

  api.updateScene({
    appState: {
      multiElement: null,
      newElement: null,
      selectedElementIds,
    },
    captureUpdate: CaptureUpdateAction.NEVER,
  });
};

/**
 * Excalidraw keeps line/arrow in multi-point mode until Enter/Escape.
 * On the second click (capture phase, before Excalidraw), pin the endpoint and
 * finish the element as a simple two-point segment.
 */
export const attachAutoFinalizeLineTool = (
  api: ExcalidrawImperativeAPI,
  root: HTMLElement,
) => {
  let finalizing = false;

  const onPointerDownCapture = (event: PointerEvent) => {
    if (finalizing || event.button !== 0 || isUiChromeTarget(event.target)) {
      return;
    }

    const multiElement = api.getAppState().multiElement;
    if (!isLinearMultiElement(multiElement)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const scenePoint = clientToSceneCoords(api, event.clientX, event.clientY);
    const points = buildTwoPointSegment(
      multiElement,
      scenePoint.x,
      scenePoint.y,
    );

    finalizing = true;
    try {
      exitMultiPointMode(api, multiElement.id, points);
    } finally {
      finalizing = false;
    }
  };

  root.addEventListener("pointerdown", onPointerDownCapture, true);
  return () => {
    root.removeEventListener("pointerdown", onPointerDownCapture, true);
  };
};

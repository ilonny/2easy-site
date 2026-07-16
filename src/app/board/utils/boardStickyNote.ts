"use client";

import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { getViewportCenterSceneCoords } from "./boardExcalidrawCoords";

export const STICKY_NOTE_WIDTH = 220;
export const STICKY_NOTE_HEIGHT = 220;

export type TStickyNoteColor = {
  background: string;
  stroke: string;
};

/** Miro-like pastel fills with a slightly deeper edge. */
export const STICKY_NOTE_COLORS: readonly TStickyNoteColor[] = [
  { background: "#ffec99", stroke: "#ffd43b" },
  { background: "#ffc9c9", stroke: "#ff8787" },
  { background: "#ffd8a8", stroke: "#ffa94d" },
  { background: "#b2f2bb", stroke: "#69db7c" },
  { background: "#a5d8ff", stroke: "#4dabf7" },
  { background: "#eebefa", stroke: "#da77f2" },
  { background: "#e9ecef", stroke: "#adb5bd" },
  { background: "#ffffff", stroke: "#ced4da" },
];

const STICKY_NOTE_TEXT_COLOR = "#212529";
const DEFAULT_STICKY_COLOR = STICKY_NOTE_COLORS[0];

const createStickyNoteSkeleton = (
  x: number,
  y: number,
  color: TStickyNoteColor,
) => ({
  type: "rectangle" as const,
  x,
  y,
  width: STICKY_NOTE_WIDTH,
  height: STICKY_NOTE_HEIGHT,
  backgroundColor: color.background,
  strokeColor: color.stroke,
  fillStyle: "solid" as const,
  strokeWidth: 1,
  roughness: 0,
  roundness: null,
  label: {
    text: " ",
    fontSize: 20,
    strokeColor: STICKY_NOTE_TEXT_COLOR,
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  },
});

/** Places a sticky at the viewport center. Double-click afterward to type. */
export const insertStickyNote = (
  api: ExcalidrawImperativeAPI,
  color: TStickyNoteColor = DEFAULT_STICKY_COLOR,
) => {
  const center = getViewportCenterSceneCoords(api);
  const newElements = convertToExcalidrawElements(
    [
      createStickyNoteSkeleton(
        center.x - STICKY_NOTE_WIDTH / 2,
        center.y - STICKY_NOTE_HEIGHT / 2,
        color,
      ),
    ],
    { regenerateIds: true },
  );

  api.updateScene({
    elements: [...api.getSceneElementsIncludingDeleted(), ...newElements],
    appState: {
      selectedElementIds: {},
      editingTextElement: null,
      newElement: null,
    },
    captureUpdate: CaptureUpdateAction.IMMEDIATELY,
  });
};

import type { Collaborator, SocketId } from "@excalidraw/excalidraw/types";
import { TBoardCursor } from "../types";

const BOARD_TEACHER_CURSOR_COLORS = {
  background: "#2563eb",
  stroke: "#2563eb",
} as const;

const BOARD_STUDENT_CURSOR_COLORS = {
  background: "#16a34a",
  stroke: "#16a34a",
} as const;

export const getBoardCursorColor = (isStudent: boolean) =>
  isStudent
    ? BOARD_STUDENT_CURSOR_COLORS.background
    : BOARD_TEACHER_CURSOR_COLORS.background;

export const buildBoardCollaboratorsMap = (
  cursors: TBoardCursor[],
): Map<SocketId, Collaborator> => {
  return new Map(
    cursors.map((cursor) => [
      cursor.id as SocketId,
      {
        pointer: {
          x: cursor.x,
          y: cursor.y,
          tool: cursor.tool,
        },
        button: cursor.button,
        username: cursor.username,
        id: cursor.id,
        color: cursor.isStudent
          ? BOARD_STUDENT_CURSOR_COLORS
          : BOARD_TEACHER_CURSOR_COLORS,
      },
    ]),
  );
};

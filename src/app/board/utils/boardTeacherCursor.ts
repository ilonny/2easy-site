import type { Collaborator, SocketId } from "@excalidraw/excalidraw/types";
import { TBoardTeacherCursor } from "../types";

export const BOARD_TEACHER_SOCKET_ID = "board-teacher" as SocketId;

/** Excalidraw derives cursor color from collaborator.id hash — fixed id → purple hue */
export const BOARD_TEACHER_CURSOR_COLOR_ID = "t7";

export const BOARD_TEACHER_CURSOR_COLORS = {
  background: "#3f28c6",
  stroke: "#3f28c6",
} as const;

export const isBoardTeacherParticipantId = (participantId?: string) =>
  !!participantId?.startsWith("user:");

export const buildTeacherCollaboratorsMap = (
  cursor: TBoardTeacherCursor | null,
): Map<SocketId, Collaborator> => {
  if (!cursor) {
    return new Map();
  }

  return new Map([
    [
      BOARD_TEACHER_SOCKET_ID,
      {
        pointer: {
          x: cursor.x,
          y: cursor.y,
          tool: cursor.tool,
        },
        button: cursor.button,
        username: null,
        id: BOARD_TEACHER_CURSOR_COLOR_ID,
        color: BOARD_TEACHER_CURSOR_COLORS,
      },
    ],
  ]);
};

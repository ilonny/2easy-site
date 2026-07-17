import { TBoardCursor, TBoardParticipant } from "../types";

export type TBoardParticipantView = TBoardParticipant & {
  x?: number;
  y?: number;
};

const sortParticipants = (participants: TBoardParticipantView[]) =>
  [...participants].sort((left, right) => {
    if (left.isStudent !== right.isStudent) {
      return left.isStudent ? 1 : -1;
    }
    return left.username.localeCompare(right.username, undefined, {
      sensitivity: "base",
    });
  });

/** Merge WS participants with live cursor positions; teacher first, then students. */
export const buildBoardParticipantsView = (
  participants: TBoardParticipant[],
  cursors: TBoardCursor[],
): TBoardParticipantView[] => {
  const cursorById = new Map(cursors.map((cursor) => [cursor.id, cursor]));

  if (participants.length) {
    return sortParticipants(
      participants.map((participant) => {
        const cursor = cursorById.get(participant.id);
        return {
          ...participant,
          x: cursor?.x,
          y: cursor?.y,
        };
      }),
    );
  }

  return sortParticipants(
    cursors.map((cursor) => ({
      id: cursor.id,
      username: cursor.username,
      isStudent: cursor.isStudent,
      x: cursor.x,
      y: cursor.y,
    })),
  );
};

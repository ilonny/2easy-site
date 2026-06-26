export type TBoard = {
  id: number;
  title: string;
  description?: string;
  student_id?: string;
  group_id?: string;
  tags?: string;
  image_id?: string;
  image_path?: string;
  user_id: number;
  is_deleted?: string;
  created_from_id?: number;
  created_from_2easy?: number;
  is_free?: string;
  lesson_id?: number;
  student_ids?: string;
  canEdit?: boolean;
};

export type TBoardContent = {
  type: string;
  data: TBoardSnapshot;
  version: number;
  is_visible?: number;
};

export type TBoardSnapshot = {
  format: "excalidraw";
  elements: readonly unknown[];
  files: Record<string, unknown>;
  appState: Record<string, unknown>;
};

export const EMPTY_BOARD_SNAPSHOT: TBoardSnapshot = {
  format: "excalidraw",
  elements: [],
  files: {},
  appState: {},
};

export const normalizeBoardSnapshot = (raw?: unknown): TBoardSnapshot => {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_BOARD_SNAPSHOT };
  }
  const data = raw as Partial<TBoardSnapshot>;
  return {
    format: "excalidraw",
    elements: Array.isArray(data.elements) ? data.elements : [],
    files:
      data.files && typeof data.files === "object"
        ? (data.files as Record<string, unknown>)
        : {},
    appState:
      data.appState && typeof data.appState === "object"
        ? (data.appState as Record<string, unknown>)
        : {},
  };
};

export const snapshotToExcalidrawInitialData = (snapshot: TBoardSnapshot) => ({
  elements: snapshot.elements as never[],
  files: snapshot.files as never,
  appState: snapshot.appState as never,
});

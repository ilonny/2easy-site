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
  scope_student_id?: number | null;
  scope?: "individual" | "group";
  room_key?: string;
  anchor_lesson_id?: number;
  student_ids?: string;
  canEdit?: boolean;
  "board_relations.id"?: number;
};

export type TBoardFormFields = {
  title: string;
  description: string;
  tags: string;
};

export type TBoardSaveStatus =
  | "idle"
  | "loading"
  | "saving"
  | "saved"
  | "error"
  | "connecting"
  | "connected";

export type TLessonBoardScope = "individual" | "group";

export type TBoardCursor = {
  id: string;
  username: string;
  isStudent: boolean;
  x: number;
  y: number;
  tool: "pointer" | "laser";
  button: "up" | "down";
};

export type TBoardSnapshot = {
  format: "excalidraw";
  elements: readonly unknown[];
  files: Record<string, unknown>;
  appState: Record<string, unknown>;
};

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
  | "waiting_for_host"
  | "connecting"
  | "connected";

export type TLessonBoardScope = "individual" | "group";

export type TBoardSessionStatus = {
  active: boolean;
  waiting_for_host: boolean;
  is_host: boolean;
  room_key?: string;
  session?: {
    id: number;
    board_id: number;
    room_key?: string;
    status?: string;
  } | null;
};

export type TBoardWsParticipant = {
  id: string;
  isStudent: boolean;
  userId?: number;
  studentId?: number;
  displayName: string;
};

export type TBoardTeacherCursor = {
  id: string;
  username: string;
  x: number;
  y: number;
  tool: "pointer" | "laser";
  button: "up" | "down";
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

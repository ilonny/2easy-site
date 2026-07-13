/** Solo editor: save to REST API */
export const BOARD_SAVE_DEBOUNCE_MS = 2500;

/** Realtime: send scene snapshot over WebSocket (DB persist stays debounced on server) */
export const BOARD_REALTIME_SAVE_DEBOUNCE_MS = 400;

export const BOARD_CURSOR_THROTTLE_MS = 40;

export const BOARD_WS_PATH = "/api/board/ws";

export const BOARD_REALTIME_PING_MS = 25000;

export const BOARD_CARD_IMAGE_HEIGHT = 317;
export const BOARD_CARD_FOOTER_MIN_HEIGHT = 100;

export const BOARD_EDITOR_JIVO_OFFSET_PX = 85;

/** Realtime lesson page — fullscreen board without site chrome */
export const BOARD_LESSON_PAGE_PATH_PREFIX = "/board/";
export const BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX = "/boards/";

export const BOARD_FORM_MODAL_CLASS_NAMES = {
  closeButton: "z-20",
};

export const BOARD_EDITOR_MODAL_CLASS_NAMES = {
  base: "m-0 max-w-full h-[100dvh] min-h-[100dvh] rounded-none",
  wrapper: "items-center p-0",
  header: "shrink-0 border-b border-default-200",
  body: "flex flex-1 min-h-0 flex-col overflow-hidden p-0",
  closeButton: "z-20",
};

export const BOARD_SAVE_STATUS_LABEL_KEY: Record<
  | "loading"
  | "saving"
  | "saved"
  | "error"
  | "connecting"
  | "connected",
  string
> = {
  loading: "boards.loading",
  saving: "boards.saving",
  saved: "boards.saved",
  error: "boards.saveError",
  connecting: "boards.connecting",
  connected: "boards.connected",
};

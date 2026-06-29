export const BOARD_SAVE_DEBOUNCE_MS = 2500;

export const BOARD_WS_PATH = "/api/board/ws";

export const BOARD_REALTIME_PING_MS = 25000;

export const BOARD_CARD_IMAGE_HEIGHT = 317;
export const BOARD_CARD_FOOTER_MIN_HEIGHT = 100;

export const BOARD_EDITOR_JIVO_OFFSET_PX = 85;

export const BOARD_MODAL_CLASS_NAMES = {
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
  | "waiting_for_host"
  | "connecting"
  | "connected",
  string
> = {
  loading: "boards.loading",
  saving: "boards.saving",
  saved: "boards.saved",
  error: "boards.saveError",
  waiting_for_host: "boards.waitingForHost",
  connecting: "boards.connecting",
  connected: "boards.connected",
};

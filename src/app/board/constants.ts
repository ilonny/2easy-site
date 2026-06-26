export const BOARD_SAVE_DEBOUNCE_MS = 2500;

export const BOARD_EDITOR_MODAL_CLASS_NAMES = {
  base: "max-h-[92dvh] max-w-[1280px] w-[min(100%,1280px)] mx-auto my-2 sm:my-4",
  wrapper: "items-center px-4 sm:px-0",
  body: "pb-4",
};

export const BOARD_SAVE_STATUS_LABEL_KEY: Record<
  "loading" | "saving" | "saved" | "error",
  string
> = {
  loading: "boards.loading",
  saving: "boards.saving",
  saved: "boards.saved",
  error: "boards.saveError",
};

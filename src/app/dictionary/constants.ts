export const DICTIONARY_SEARCH_DEBOUNCE_MS = 500;

export const DICTIONARY_LIST_SCROLL_CLASS =
  "flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]";

export const DICTIONARY_MODAL_HEIGHT_CLASS =
  "h-[min(600px,calc(100dvh-2rem))] min-h-[min(600px,calc(100dvh-2rem))] max-h-[min(600px,calc(100dvh-2rem))]";

export const DICTIONARY_MODAL_ADAPTIVE_SIDE_PADDING_CLASS = "px-4 sm:px-0";

export const DICTIONARY_MODAL_CLASS_NAMES = {
  base: [
    "mx-auto w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
    DICTIONARY_MODAL_HEIGHT_CLASS,
  ].join(" "),
  wrapper: `items-center ${DICTIONARY_MODAL_ADAPTIVE_SIDE_PADDING_CLASS}`,
  body: "overflow-hidden py-0",
};

export const DICTIONARY_MODAL_CONTENT_CLASS =
  "h-full min-h-0 flex flex-col overflow-hidden";

export const DICTIONARY_MODAL_SECTION_PADDING_CLASS = "px-3 sm:px-6";

export const DICTIONARY_MODAL_FOOTER_PADDING_CLASS =
  `${DICTIONARY_MODAL_SECTION_PADDING_CLASS} py-3 sm:py-4`;

export const DICTIONARY_MODAL_BODY_CLASS =
  "gap-3 sm:gap-4 px-0 text-sm flex flex-col flex-1 min-h-0 overflow-hidden";

export const DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS = "text-xs sm:text-sm";

export const DICTIONARY_MODAL_BLOCK_SPACING_CLASS = "pt-3 sm:pt-4";

export const DICTIONARY_MODAL_INPUTS_BLOCK_CLASS =
  "pt-1 pb-3 sm:pb-4 border-b border-[#eee] shrink-0";

export const DICTIONARY_MODAL_INPUT_ROW_CLASS =
  "flex items-center gap-2 sm:gap-3 w-full min-w-0";

export const DICTIONARY_MODAL_CENTERED_BLOCK_CLASS =
  "flex justify-center pt-3 sm:pt-4";

export const DICTIONARY_MODAL_ADD_WORD_BUTTON_CLASS =
  "shrink-0 !w-10 !h-10 !min-w-10 self-center touch-manipulation";

export const DICTIONARY_MODAL_SELECT_ALL_DIVIDER_CLASS =
  "hidden sm:block flex-1 border-t border-dotted border-[#ccc] min-w-[24px]";

export const DICTIONARY_TOUCH_BUTTON_CLASS = "min-w-0 touch-manipulation";

export const DICTIONARY_ACTIONS_POPOVER_CLASS =
  "flex w-full max-w-[calc(100vw-2rem)] flex-col items-stretch bg-white p-2 text-sm";

export const DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS =
  "max-h-[min(90dvh,100%)]";

export const DICTIONARY_SECONDARY_MODAL_CONTENT_CLASS = [
  DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS,
  "flex flex-col min-h-0",
].join(" ");

export const DICTIONARY_SECONDARY_MODAL_SCROLL_BODY_CLASS = [
  "gap-4 text-sm overflow-y-auto overscroll-contain",
  "[-webkit-overflow-scrolling:touch]",
].join(" ");

export const DICTIONARY_WORD_CARD_BASE_CLASS =
  "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer touch-manipulation min-w-0";

export const DICTIONARY_MODAL_TABS_CLASS_NAMES = {
  base: "w-full",
  tabList: "grid grid-cols-2 w-full border-b border-[#eee] p-0 gap-0",
  tab: "w-full h-10 justify-center px-2 text-xs sm:text-sm",
  cursor: "w-full bg-primary",
  tabContent: "w-full text-center whitespace-normal sm:whitespace-nowrap",
};

export const DICTIONARY_MODAL_FOOTER_CLASS =
  `flex flex-col gap-2 items-end sm:items-center sm:flex-row text-sm shrink-0 ${DICTIONARY_MODAL_FOOTER_PADDING_CLASS}`;

export const DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS =
  "flex w-full flex-wrap items-center justify-end gap-2 sm:justify-center";

export const DICTIONARY_WORD_FILTER_SEGMENT_CONTAINER_CLASS =
  "flex w-full max-w-md rounded-lg bg-[#F4F4F5] p-0";

export const DICTIONARY_WORD_FILTER_SEGMENT_BUTTON_BASE_CLASS =
  "flex-1 px-1 py-1.5 text-xs sm:text-sm transition-colors touch-manipulation";

export const DICTIONARY_WORD_FILTER_SEGMENT_BUTTON_LEFT_CLASS = "rounded-l-md";

export const DICTIONARY_WORD_FILTER_SEGMENT_BUTTON_RIGHT_CLASS = "rounded-r-md";

export const DICTIONARY_WORD_FILTER_SEGMENT_BUTTON_ACTIVE_CLASS =
  "bg-primary text-white font-medium shadow-sm";

export const DICTIONARY_WORD_FILTER_SEGMENT_BUTTON_INACTIVE_CLASS =
  "text-[#767676] hover:text-[#231F20]";

export const DICTIONARY_ADD_WORD_MODAL_CLASS_NAMES = {
  base: [
    "mx-auto w-full sm:max-w-md",
    DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS,
  ].join(" "),
  wrapper: `items-center ${DICTIONARY_MODAL_ADAPTIVE_SIDE_PADDING_CLASS}`,
};

export const DICTIONARY_ADD_WORD_MODAL_FOOTER_CLASS = [
  DICTIONARY_MODAL_FOOTER_PADDING_CLASS,
  "gap-2 text-sm shrink-0",
  "flex flex-row flex-wrap items-center justify-end sm:justify-center",
].join(" ");

export const DICTIONARY_CONFIRM_MODAL_CLASS_NAMES = {
  base: [
    "mx-auto w-full max-w-[calc(100vw-1rem)] sm:max-w-md",
    DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS,
  ].join(" "),
  wrapper: "items-center px-2 sm:px-4",
};

export const ICON_DICTIONARY_BUTTON_BASE_CLASS =
  "shrink-0 rounded-lg p-0 touch-manipulation";

export const ICON_DICTIONARY_BUTTON_DEFAULT_SIZE_CLASS =
  "h-9 w-9 min-h-9 min-w-9 max-h-9 max-w-9";

export const ICON_DICTIONARY_BUTTON_COMPACT_SIZE_CLASS =
  "!h-7 !w-7 !min-h-7 !min-w-7 !max-h-7 !max-w-7 md:!h-9 md:!w-9 md:!min-h-9 md:!min-w-9 md:!max-h-9 md:!max-w-9";

export const LESSON_PARTICIPANT_DICTIONARY_ICON_WRAPPER_CLASS =
  "flex h-7 w-full shrink-0 items-center justify-center md:h-auto md:w-auto md:justify-start";

export const DICTIONARY_CONFIRM_MODAL_TITLE_CLASS =
  "text-sm sm:text-base break-words";

export const DICTIONARY_FIELD_LABEL_CLASS =
  "block subpixel-antialiased pointer-events-none origin-top-left text-sm text-[#767676]";

export const DICTIONARY_INPUT_CLASS_NAMES = {
  base: "w-full min-w-0",
  inputWrapper: "bg-white hove min-w-0",
  input: "text-sm",
  label: DICTIONARY_FIELD_LABEL_CLASS,
};

export const DICTIONARY_READONLY_INPUT_CLASS_NAMES = {
  ...DICTIONARY_INPUT_CLASS_NAMES,
  inputWrapper: [
    DICTIONARY_INPUT_CLASS_NAMES.inputWrapper,
    "shadow-none",
    "cursor-default",
    "data-[hover=true]:!bg-white",
    "group-data-[focus=true]:!bg-white",
    "data-[hover=true]:border-default-200",
    "group-data-[focus=true]:border-default-200",
  ].join(" "),
  innerWrapper: "cursor-default",
  input: [
    DICTIONARY_INPUT_CLASS_NAMES.input,
    "cursor-default",
    "pointer-events-none",
    "select-none",
  ].join(" "),
};

export const DICTIONARY_MODAL_INPUT_CLASS_NAMES = {
  base: "flex-1 min-w-0",
  inputWrapper: "bg-white hove min-w-0",
  input: "text-sm",
};

export const DICTIONARY_SEARCH_INPUT_CLASS_NAMES = {
  base: "w-full min-w-0",
  inputWrapper: "bg-white hove min-w-0",
  input: "text-sm",
};

export const SPEECH_SYNTHESIZE_PATH = "/speech/synthesize";

export const SPEAK_WORD_BUTTON_SIZE = 18;
export const SPEAK_WORD_BUTTON_CLASS =
  "shrink-0 flex items-center justify-center min-h-10 min-w-10 h-10 w-10 sm:min-h-8 sm:min-w-8 sm:h-8 sm:w-8 rounded-full text-primary hover:bg-[#eeebff] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer pointer-events-auto touch-manipulation";

export const ADD_WORD_SPEAK_ID = "add-word-source";

export const DICTIONARY_SEARCH_DEBOUNCE_MS = 500;
export const DICTIONARY_LIST_HEIGHT_CLASS = "h-[300px] min-h-[300px]";

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
  "shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-primary hover:bg-[#eeebff] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer pointer-events-auto";

export const ADD_WORD_SPEAK_ID = "add-word-source";

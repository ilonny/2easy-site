import i18n from "@/i18n/config";

/** UI language for AI assistant replies (`ru` | `en`). */
export const getAiUiLanguage = (): "ru" | "en" =>
  i18n.language?.toLowerCase().startsWith("en") ? "en" : "ru";

import { TTemplate } from "../../create/ChooseTemplateModal/templates";

export const mapTypeToTitle = (type?: TTemplate["type"]) => {
  if (!type) {
    return "";
  }
  switch (type) {
    case "image":
      return "Изображение";
    case "text-default":
      return "Текст";
    case "text-2-col":
      return "Текст в две колонки";
    case "text-sticker":
      return "Текст на стикерах";
    case "text-checklist":
      return "Чек лист";
    case "video":
      return "Видео";
    case "audio":
      return "Аудио";
    case "note":
      return "Заметка";
    case "fill-gaps-select":
      return "Вариант из списка";
    case "fill-gaps-input":
      return "Вписать слово в пропуск";
    case "fill-gaps-drag":
      return "Перетащить слово из списка";
    case "match-word-word":
      return "Match слова с определением";
    case "match-word-image":
      return "Match слова с изображением";
    case "match-word-column":
      return "Расставить слова по колонкам";
    default:
      return type;
  }
};

export const getImageNameFromPath = (p: string) => {
  if (!p) {
    return "";
  }
  return p?.split("/")?.reverse()?.[0] || "";
};

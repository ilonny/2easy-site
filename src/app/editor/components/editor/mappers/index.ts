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
    default:
      return type;
  }
};

export const getImageNameFromPath = (p: string) => {
  return p.split("/").reverse()?.[0] || "";
};

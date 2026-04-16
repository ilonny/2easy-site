import { TTemplate } from "../../create/ChooseTemplateModal/templates";
import i18n from "@/i18n/config";

export const mapTypeToTitle = (type?: TTemplate["type"]) => {
  if (!type) {
    return "";
  }
  switch (type) {
    case "image":
      return i18n.t("templates.images", { defaultValue: "Изображения" });
    case "text-default":
      return i18n.t("templates.text", { defaultValue: "Текст" });
    case "text-2-col":
      return i18n.t("templates.text2Col", { defaultValue: "Текст в 2 колонки" });
    case "text-sticker":
      return i18n.t("templates.textSticker", {
        defaultValue: "Текст на стикерах",
      });
    case "text-checklist":
      return i18n.t("templates.textChecklist", { defaultValue: "Чек-лист" });
    case "video":
      return i18n.t("templates.video", { defaultValue: "Видео" });
    case "audio":
      return i18n.t("templates.audio", { defaultValue: "Аудио" });
    case "note":
      return i18n.t("templates.note", { defaultValue: "Заметка" });
    case "fill-gaps-select":
      return i18n.t("templates.fillGapsSelect", {
        defaultValue: "Выбрать вариант из списка",
      });
    case "fill-gaps-input":
      return i18n.t("templates.fillGapsInput", {
        defaultValue: "Вписать слово в пропуск",
      });
    case "fill-gaps-drag":
      return i18n.t("templates.fillGapsDrag", {
        defaultValue: "Перетащить слово из списка",
      });
    case "match-word-word":
      return i18n.t("templates.matchWordWord", {
        defaultValue: "Match слова с определением",
      });
    case "match-word-image":
      return i18n.t("templates.matchWordImage", {
        defaultValue: "Match слова с изображением",
      });
    case "match-word-column":
      return i18n.t("templates.matchWordColumn", {
        defaultValue: "Расставить слова по колонкам",
      });
    case "test":
      return i18n.t("templates.test", { defaultValue: "Тест" });
    case "free-input-form":
      return i18n.t("templates.freeInput", {
        defaultValue: "Поле для ввода текста",
      });
    case "int":
      return i18n.t("templates.integrations", { defaultValue: "Интеграции" });
    case "FILL_GAPS_NEW":
      return i18n.t("templates.fillGapsNew", {
        defaultValue: "ЗАПОЛНИТЬ ПРОПУСКИ",
      });
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

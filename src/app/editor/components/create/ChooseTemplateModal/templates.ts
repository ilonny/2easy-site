import TextDefaultBg from "@/assets/images/text_default_bg.png";
import Text2ColBg from "@/assets/images/text_2_col_bg.png";
import TextStickerBg from "@/assets/images/text_sticker_bg.png";
import TextChecklistBg from "@/assets/images/text_checklist_bg.png";
import { StaticImageData } from "next/image";

export type TTemplate = {
  type: string;
  title: string;
  bgImage?: StaticImageData;
  description?: string;
  subTemplates?: TTemplate[];
  subItems?: TTemplate[];
};

export const templates: TTemplate[] = [
  {
    type: "text",
    title: "Текст",
    description: "Статьи, вопросы и другие текстовые блоки",
    subItems: [
      {
        type: "text-default",
        title: "Текст",
        bgImage: TextDefaultBg,
      },
      {
        type: "text-2-col",
        title: "Текст в 2 колонки",
        bgImage: Text2ColBg,
      },
      {
        type: "text-sticker",
        title: "Текст на стикерах",
        bgImage: TextStickerBg,
      },
      {
        type: "text-checklist",
        title: "Чек-лист",
        bgImage: TextChecklistBg,
      },
    ],
  },
  {
    type: "image",
    title: "Изображения",
    description: "jpg, png, svg, gif",
  },
  {
    type: "video",
    title: "Видео",
    description: "mp4, mov, webm",
  },
  {
    type: "audio",
    title: "Аудио",
    description: "mp3, mp4",
  },
  {
    type: "note",
    title: "Заметка",
    description: "for teachers only",
  },
  {
    type: "fill_gaps",
    title: "Заполнить пропуски",
    description: "Перетащить, вписать или выбрать правильное слово",
    subItems: [
      {
        type: "fill-gaps-drag",
        title: "Перетащить слово из списка",
      },
      {
        type: "fill-gaps-select",
        title: "Выбрать вариант из списка",
      },
      {
        type: "fill-gaps-input",
        title: "Вписать слово в пропуск",
      },
    ],
  },
  {
    type: "test",
    title: "Тест",
    description: "Выбрать правильный вариант из предложенных",
  },
  {
    type: "match_words",
    title: "Смэтчить слова",
    description: "Сопоставить слово с картинкой или определением",
  },
];

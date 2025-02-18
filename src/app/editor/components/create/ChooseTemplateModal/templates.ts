export type TTemplate = {
  type: string;
  title: string;
  bgImage?: string;
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
      },
      {
        type: "text-2-col",
        title: "Текст в 2 колонки",
      },
      {
        type: "text-sticker",
        title: "Текст на стикерах",
      },
      {
        type: "text-checklist",
        title: "Чек-лист",
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

export type TTemplate = {
  type: string;
  title: string;
  description?: string;
  subTemplates?: TTemplate[];
};

export const templates: TTemplate[] = [
  {
    type: "text",
    title: "Текст",
    description: "Статьи, вопросы и другие текстовые блоки",
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

export const AI_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

export type TAiLevel = (typeof AI_LEVELS)[number];

export type TAiExerciseTypeOption = {
  type: string;
  titleKey: string;
  titleDefault: string;
};

/** Leaf exercise types available for AI generation (no media/embeds). */
export const AI_EXERCISE_TYPE_OPTIONS: TAiExerciseTypeOption[] = [
  {
    type: "text-default",
    titleKey: "templates.text",
    titleDefault: "Текст",
  },
  {
    type: "text-2-col",
    titleKey: "templates.text2Col",
    titleDefault: "Текст в 2 колонки",
  },
  {
    type: "text-sticker",
    titleKey: "templates.textSticker",
    titleDefault: "Текст на стикерах",
  },
  {
    type: "text-checklist",
    titleKey: "templates.textChecklist",
    titleDefault: "Чек-лист",
  },
  {
    type: "note",
    titleKey: "templates.note",
    titleDefault: "Заметка",
  },
  {
    type: "FILL_GAPS_NEW",
    titleKey: "templates.fillGapsNew",
    titleDefault: "Заполнить пропуски",
  },
  {
    type: "test",
    titleKey: "templates.test",
    titleDefault: "Тест",
  },
  {
    type: "match-word-word",
    titleKey: "templates.matchWordWord",
    titleDefault: "Match слова с определением",
  },
  {
    type: "match-word-column",
    titleKey: "templates.matchWordColumn",
    titleDefault: "Расставить слова по колонкам",
  },
  {
    type: "free-input-form",
    titleKey: "templates.freeInput",
    titleDefault: "Поле для ввода текста",
  },
];

export type TAiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type TAiGeneratedExercise = {
  type: string;
  sortIndex: number;
  data: Record<string, any>;
};

export type TAiGeneratedLesson = {
  title: string;
  description: string;
  tags: string;
};

export type TAiLessonDraft = {
  assistantMessage: string;
  lesson: TAiGeneratedLesson;
  exercises: TAiGeneratedExercise[];
};

/** Sentence-style Capitalize: "ЗАПОЛНИТЬ ПРОПУСКИ" → "Заполнить пропуски" */
export const toCapitalizeLabel = (label: string) => {
  const trimmed = String(label || "").trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLocaleLowerCase("ru-RU");
  return lower.charAt(0).toLocaleUpperCase("ru-RU") + lower.slice(1);
};

export const getExerciseTypeLabel = (type: string) => {
  const found = AI_EXERCISE_TYPE_OPTIONS.find((o) => o.type === type);
  return toCapitalizeLabel(found?.titleDefault || type);
};

export const getExercisePreviewTitle = (ex: TAiGeneratedExercise) => {
  const data = ex.data || {};
  return (
    data.title ||
    data.subtitle ||
    data.description ||
    getExerciseTypeLabel(ex.type)
  );
};

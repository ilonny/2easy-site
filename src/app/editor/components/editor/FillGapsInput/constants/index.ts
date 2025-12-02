/** Заголовок упражнения по умолчанию */
export const DEFAULT_TITLE = "Let's practice!";
/** Цвет заголовка по умолчанию (фиолетовый) */
export const DEFAULT_TITLE_COLOR = "#3F28C6";
/** Подзаголовок упражнения по умолчанию */
export const DEFAULT_SUBTITLE = "Fill in the gaps with the correct words";
/** Описание упражнения по умолчанию */
export const DEFAULT_DESCRIPTION = "Answer the questions below";
/** ID для contentEditable элемента */
export const CONTENT_EDITABLE_ID = "contentEditableWrapper";
/** CSS класс для элементов пропусков */
export const ANSWER_WRAPPER_CLASS = "answerWrapper";

/** Объект со всеми значениями по умолчанию для нового упражнения */
export const DEFAULT_VALUES_STUB = {
  title: DEFAULT_TITLE,
  titleColor: DEFAULT_TITLE_COLOR,
  subtitle: DEFAULT_SUBTITLE,
  description: DEFAULT_DESCRIPTION,
  images: [],
  dataText: "",
  fields: [],
} as const;


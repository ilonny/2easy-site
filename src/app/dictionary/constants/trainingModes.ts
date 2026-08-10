import { TrainingMode } from "../types";

export type TTrainingModeMeta = {
  key: TrainingMode;
  titleKey: string;
  titleDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
};

export const TRAINING_MODES: TTrainingModeMeta[] = [
  {
    key: "cards",
    titleKey: "dictionary.training.modeCards",
    titleDefault: "Карточки",
    descriptionKey: "dictionary.training.modeCardsDescription",
    descriptionDefault: "Переворачивайте карточки и вспоминайте перевод",
  },
  {
    key: "quizOptions",
    titleKey: "dictionary.training.modeQuizOptions",
    titleDefault: "Тест с вариантами",
    descriptionKey: "dictionary.training.modeQuizOptionsDescription",
    descriptionDefault: "Выберите правильный перевод из четырёх вариантов",
  },
  {
    key: "quizInput",
    titleKey: "dictionary.training.modeQuizInput",
    titleDefault: "Тест без вариантов",
    descriptionKey: "dictionary.training.modeQuizInputDescription",
    descriptionDefault: "Впишите перевод слова самостоятельно",
  },
];

export const TRAINING_MODES_BY_KEY = TRAINING_MODES.reduce(
  (acc, mode) => {
    acc[mode.key] = mode;
    return acc;
  },
  {} as Record<TrainingMode, TTrainingModeMeta>
);

export const getTrainingMode = (mode: TrainingMode) =>
  TRAINING_MODES_BY_KEY[mode];

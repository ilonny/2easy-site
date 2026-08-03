import { TAiLessonDraft } from "@/app/lessons/components/CreateLessonWithAiModal/types";

export type TAiExerciseDiff = {
  key: string;
  index: number;
  type: string;
  title: string;
  changedFields: string[];
  details: Array<{ label: string; before: string; after: string }>;
};

export type TAiDraftDiff = {
  meta: Array<{
    field: "title" | "description" | "tags";
    label: string;
    before: string;
    after: string;
  }>;
  added: TAiExerciseDiff[];
  modified: TAiExerciseDiff[];
  removed: TAiExerciseDiff[];
};

const FIELD_LABELS: Record<string, string> = {
  title: "заголовок",
  subtitle: "инструкция",
  description: "описание",
  content: "текст",
  secondContent: "вторая колонка",
  stickers: "пункты",
  questions: "вопросы",
  matches: "пары слов",
  columns: "колонки",
  gaps: "пропуски",
  words: "слова",
  items: "элементы",
  viewType: "отображение",
};

const MEDIA_FIELDS = new Set([
  "images",
  "editorImages",
  "secondEditorImages",
  "videos",
  "bgAttachments",
  "editorAttachments",
  "secondEditorAttachments",
  "attachments",
]);

const stable = (value: unknown) => {
  const visit = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(visit);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, child]) => [key, visit(child)]),
      );
    }
    return input;
  };
  return JSON.stringify(visit(value));
};

const valuePreview = (value: unknown) => {
  if (typeof value === "string") {
    const text = value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 110 ? `${text.slice(0, 107)}…` : text;
  }
  if (Array.isArray(value)) return `${value.length} элементов`;
  if (value === null || value === undefined || value === "") return "Не указано";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "Содержимое изменено";
};

const exerciseKey = (
  exercise: TAiLessonDraft["exercises"][number],
  index: number,
) =>
  exercise.id
    ? `id:${exercise.id}`
    : exercise.clientKey
      ? `new:${exercise.clientKey}`
      : `index:${index}:${exercise.type}`;

const toDiff = (
  exercise: TAiLessonDraft["exercises"][number],
  index: number,
  changedFields: string[] = [],
  details: TAiExerciseDiff["details"] = [],
): TAiExerciseDiff => ({
  key: exerciseKey(exercise, index),
  index,
  type: exercise.type,
  title: String(exercise.data?.title || `Задание ${index + 1}`),
  changedFields,
  details,
});

export const buildDraftDiff = (
  baseline: TAiLessonDraft,
  preview: TAiLessonDraft,
): TAiDraftDiff => {
  const meta: TAiDraftDiff["meta"] = [];
  const labels = {
    title: "Название урока",
    description: "Описание",
    tags: "Уровень и теги",
  };
  for (const field of ["title", "description", "tags"] as const) {
    const before = String(baseline.lesson?.[field] || "");
    const after = String(preview.lesson?.[field] || "");
    if (before !== after) {
      meta.push({ field, label: labels[field], before, after });
    }
  }

  const baseById = new Map(
    baseline.exercises
      .filter((exercise) => exercise.id)
      .map((exercise, index) => [Number(exercise.id), { exercise, index }]),
  );
  const matchedBase = new Set<number>();
  const added: TAiExerciseDiff[] = [];
  const modified: TAiExerciseDiff[] = [];

  preview.exercises.forEach((exercise, index) => {
    let match = exercise.id ? baseById.get(Number(exercise.id)) : undefined;
    if (!match) {
      const samePosition = baseline.exercises[index];
      if (
        samePosition &&
        !samePosition.id &&
        samePosition.type === exercise.type
      ) {
        match = { exercise: samePosition, index };
      }
    }
    if (!match) {
      added.push(toDiff(exercise, index));
      return;
    }
    matchedBase.add(match.index);
    const keys = new Set([
      ...Object.keys(match.exercise.data || {}),
      ...Object.keys(exercise.data || {}),
    ]);
    const changedKeys = Array.from(keys).filter(
        (key) =>
          !MEDIA_FIELDS.has(key) &&
          stable(match!.exercise.data?.[key]) !== stable(exercise.data?.[key]),
      );
    const changedFields = changedKeys
      .map((key) => FIELD_LABELS[key] || key);
    const details = changedKeys
      .map((key) => ({
        label: FIELD_LABELS[key] || key,
        before: valuePreview(match!.exercise.data?.[key]),
        after: valuePreview(exercise.data?.[key]),
      }))
      .filter(
        (item) =>
          item.before !== "Содержимое изменено" ||
          item.after !== "Содержимое изменено",
      )
      .slice(0, 3);
    if (
      match.exercise.type !== exercise.type ||
      match.exercise.sortIndex !== exercise.sortIndex ||
      changedFields.length
    ) {
      if (match.exercise.type !== exercise.type) {
        changedFields.unshift("тип задания");
      }
      if (match.exercise.sortIndex !== exercise.sortIndex) {
        changedFields.push("положение в уроке");
      }
      modified.push(
        toDiff(
          exercise,
          index,
          Array.from(new Set(changedFields)),
          details,
        ),
      );
    }
  });

  const removed = baseline.exercises
    .map((exercise, index) =>
      matchedBase.has(index) ? null : toDiff(exercise, index),
    )
    .filter(Boolean) as TAiExerciseDiff[];

  return { meta, added, modified, removed };
};

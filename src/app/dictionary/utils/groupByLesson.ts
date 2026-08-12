import i18n from "@/i18n/config";
import { TDictionaryItem } from "../types";

export type TDictionaryLessonGroup = {
  key: string;
  label: string;
  lessonId: number | null;
  items: TDictionaryItem[];
};

export const groupByLesson = (
  items: TDictionaryItem[]
): TDictionaryLessonGroup[] => {
  const groups = new Map<string, TDictionaryLessonGroup>();

  for (const item of items) {
    const key =
      item.lessonId != null
        ? `lesson:${item.lessonId}`
        : "lesson:none";
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(key, {
      key,
      lessonId: item.lessonId,
      label:
        item.lessonName?.trim() ||
        i18n.t("dictionary.training.noLessonGroup", {
          defaultValue: "Без урока",
        }),
      items: [item],
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.lessonId == null && b.lessonId != null) {
      return 1;
    }
    if (a.lessonId != null && b.lessonId == null) {
      return -1;
    }
    return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  });
};

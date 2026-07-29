import { TAiLessonDraft } from "@/app/lessons/components/CreateLessonWithAiModal/types";

export type TAiHistoryEntry = {
  id: string;
  at: number;
  /** Instruction that was applied AFTER this snapshot (why we left this state) */
  instruction: string;
  draft: TAiLessonDraft;
};

const MAX_ENTRIES = 20;

export const historyStorageKey = (lessonId: number | string) =>
  `2easy-ai-lesson-history:${lessonId}`;

export const isUndoInstruction = (text: string) =>
  /^(верн|откат|undo|rollback|назад|восстанов|как был|как было|отмени)/i.test(
    text.trim(),
  ) ||
  /верн(и|уть|ите).*(назад|обратно|как был|прежн)|отмен(и|ить).*(последн|правк)|откат(ить)?|undo|rollback/i.test(
    text,
  );

export const cloneDraft = (draft: TAiLessonDraft): TAiLessonDraft =>
  JSON.parse(JSON.stringify(draft));

export const loadHistory = (lessonId: number | string): TAiHistoryEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(historyStorageKey(lessonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && e.id && e.draft?.lesson && Array.isArray(e.draft?.exercises),
    ) as TAiHistoryEntry[];
  } catch {
    return [];
  }
};

export const saveHistory = (
  lessonId: number | string,
  entries: TAiHistoryEntry[],
) => {
  if (typeof window === "undefined") return;
  const trimmed = entries.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(historyStorageKey(lessonId), JSON.stringify(trimmed));
  } catch {
    // Quota / private mode — keep in-memory only
    try {
      // Drop oldest media-heavy attempts: keep fewer entries
      const smaller = trimmed.slice(0, 5).map((e) => ({
        ...e,
        draft: {
          ...e.draft,
          exercises: (e.draft.exercises || []).map((ex) => ({
            ...ex,
            data: stripHeavyMedia(ex.data || {}),
          })),
        },
      }));
      localStorage.setItem(
        historyStorageKey(lessonId),
        JSON.stringify(smaller),
      );
    } catch {
      /* ignore */
    }
  }
};

const stripHeavyMedia = (data: Record<string, any>) => {
  const out = { ...data };
  for (const key of [
    "images",
    "videos",
    "bgAttachments",
    "editorAttachments",
    "secondEditorAttachments",
    "attachments",
    "editorImages",
  ]) {
    if (Array.isArray(out[key]) && out[key].length > 0) {
      // Keep structure/urls if short; drop huge dataURLs
      out[key] = out[key].map((item: any) => {
        if (!item || typeof item !== "object") return item;
        const copy = { ...item };
        if (typeof copy.dataURL === "string" && copy.dataURL.length > 200) {
          delete copy.dataURL;
        }
        return copy;
      });
    }
  }
  return out;
};

export const pushHistoryEntry = (
  lessonId: number | string,
  prev: TAiHistoryEntry[],
  entry: Omit<TAiHistoryEntry, "id" | "at"> & { id?: string; at?: number },
): TAiHistoryEntry[] => {
  const next: TAiHistoryEntry[] = [
    {
      id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: entry.at || Date.now(),
      instruction: entry.instruction,
      draft: cloneDraft(entry.draft),
    },
    ...prev,
  ].slice(0, MAX_ENTRIES);
  saveHistory(lessonId, next);
  return next;
};

export const formatHistoryTime = (at: number) => {
  try {
    return new Date(at).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export const shortInstruction = (text: string, max = 72) => {
  const s = text.trim().replace(/\s+/g, " ");
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
};

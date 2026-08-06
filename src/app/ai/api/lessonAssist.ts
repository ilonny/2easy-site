import { checkResponse, fetchPostJson } from "@/api";
import { TAiLessonDraft } from "@/app/lessons/components/CreateLessonWithAiModal/types";
import { getAiUiLanguage } from "@/app/ai/uiLanguage";

export type TAiPreviewSummary = {
  exercisesAdded: number;
  exercisesModified: number;
  exercisesRemoved: number;
  metaChanged: boolean;
};

export type TAiLessonPreview = TAiLessonDraft & {
  previewId?: string;
  baseVersion?: number;
  expiresAt?: string;
  summary?: TAiPreviewSummary;
};

const parseJson = async (response: Response, fallback: string) => {
  const json = await response.json();
  if (!json?.success) {
    checkResponse(json);
    const error = new Error(json?.message || fallback) as Error & {
      code?: string;
      status?: number;
    };
    error.code = json?.code;
    error.status = response.status;
    throw error;
  }
  return json;
};

export const requestLessonPreview = async (params: {
  lessonId?: number;
  instruction: string;
  current: TAiLessonDraft;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  signal?: AbortSignal;
}): Promise<TAiLessonPreview> => {
  const response = await fetchPostJson({
    path: "/ai/refine-lesson",
    isSecure: true,
    data: {
      lesson_id: params.lessonId,
      instruction: params.instruction,
      current: params.current,
      conversation: params.conversation,
      ui_language: getAiUiLanguage(),
    },
    signal: params.signal,
  });
  const json = await parseJson(response, "Не удалось подготовить AI-превью");
  return {
    assistantMessage: json.assistantMessage || "",
    lesson: json.lesson,
    exercises: json.exercises || [],
    previewId: json.preview_id,
    baseVersion: json.base_version,
    expiresAt: json.expires_at,
    summary: json.summary,
  };
};

export const commitLessonPreview = async (params: {
  lessonId: number;
  previewId: string;
}) => {
  const response = await fetchPostJson({
    path: "/ai/commit-lesson",
    isSecure: true,
    data: {
      lesson_id: params.lessonId,
      preview_id: params.previewId,
    },
  });
  return parseJson(response, "Не удалось сохранить AI-изменения");
};

export const requestRestorePreview = async (params: {
  lessonId: number;
  draft: TAiLessonDraft;
  signal?: AbortSignal;
}): Promise<TAiLessonPreview> => {
  const response = await fetchPostJson({
    path: "/ai/preview-restore",
    isSecure: true,
    data: { lesson_id: params.lessonId, draft: params.draft },
    signal: params.signal,
  });
  const json = await parseJson(
    response,
    "Не удалось подготовить восстановление",
  );
  return {
    assistantMessage: json.assistantMessage || "",
    lesson: json.lesson,
    exercises: json.exercises || [],
    previewId: json.preview_id,
    baseVersion: json.base_version,
    expiresAt: json.expires_at,
    summary: json.summary,
  };
};
